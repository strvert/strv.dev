<template>
  <div>
    <article>
      <div class="blogpost">
        <header>
          <h1 class="post-title">{{ page === undefined ? '' : page.title }}</h1>
          <div class="post-info-wrapper">
            <div class="tag-list">
              <tag-list :tags="tags" />
            </div>
            <p class="publish-time">
              <time :datetime="dateString">{{ displayDateString }}</time
              >に{{ publishStatus }}
            </p>
          </div>
        </header>
        <nuxt-content :document="page" />
      </div>
      <div class="surround-menu">
        <surround-article-menu :path="path" :useSeries="true" :series="series" />
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, useRoute, useNuxt2Meta } from '#app';
// import BlogpostMeta from '@/components/atoms/BlogpostMeta.vue';
import SurroundArticleMenu from '@/components/atoms/SurroundArticleMenu.vue';
import TagList from '@/components/atoms/TagList.vue';
import { IArticle } from '@/composables/stores/Article';
import { PublishStatus } from '@/composables/stores/Article';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';
import { Moment } from 'moment-timezone';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';

export default defineComponent({
  layout: 'blogpost',
  components: { SurroundArticleMenu, TagList },
  setup() {
    const route = useRoute();
    const currentSlug = route.params.blogpost;

    const { page, path, series, tags } = useBlogContent(currentSlug);

    const displayDateString = ref<string>();
    const dateString = ref<string>();
    const publishStatus = ref<PublishStatus>();
    const updateDateStrings = (at: Moment, status: PublishStatus) => {
      displayDateString.value = at.format('YYYY.MM.DD');
      dateString.value = at.format();
      publishStatus.value = status;
    };

    const { makeBlogpostMeta } = useBlogpostMeta();
    const { title, meta } = makeBlogpostMeta(page);
    useNuxt2Meta({ title, meta });

    watch(page, (value: IArticle) => {
      if (value !== undefined) {
        const { createdAt, updatedAt } = readDateInfos(value);
        if (createdAt.toString() === updatedAt.toString()) {
          updateDateStrings(createdAt, '公開');
        } else {
          updateDateStrings(updatedAt, '更新');
        }
      }
    });

    return { page, displayDateString, dateString, publishStatus, path, series, tags };
  },
});
</script>

<style lang="scss" scoped>
.blogpost {
  > header {
    margin-block-end: 1.26em;
    > .post-title {
      font-size: 2rem;
      margin-block-end: 0.56em;
    }
    > .post-info-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      > .publish-time {
        font-size: 0.95rem;
        color: #00000088;
        margin: 0;
      }
    }
  }
}

.surround-menu {
  display: block;
  margin-block-start: 4rem;
}
</style>
