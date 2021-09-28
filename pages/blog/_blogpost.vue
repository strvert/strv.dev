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
        <surround-article-menu :path="pagePath" :useSeries="true" :series="series" />
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  useFetch,
  ref,
  useContext,
  onMounted,
} from '@nuxtjs/composition-api';
import SurroundArticleMenu from '@/components/atoms/SurroundArticleMenu.vue';
import TagList from '@/components/atoms/TagList.vue';
import { IArticle, PublishStatus } from '@/composables/stores/Article';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';
import { slugToPath } from '@/composables/utils/ConvertArticlePath';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';
import { Moment } from 'moment-timezone';

export default defineComponent({
  head: {},
  layout: 'blogpost',
  components: { SurroundArticleMenu, TagList },
  props: {},
  setup() {
    const { setBlogpostMeta } = useBlogpostMeta();

    const { route, $content } = useContext();
    const currentSlug = route.value.params.blogpost;
    const pagePath = slugToPath(currentSlug);

    const fetchPage = async () => {
      return await $content(pagePath).fetch();
    };
    const page = ref<IArticle>();
    const displayDateString = ref<string>();
    const dateString = ref<string>();
    const publishStatus = ref<PublishStatus>();
    const updateDateStrings = (at: Moment, status: PublishStatus) => {
      displayDateString.value = at.format('YYYY.MM.DD');
      dateString.value = at.format();
      publishStatus.value = status;
    };

    const series = ref<string>();
    const tags = ref<string[]>([]);
    const updateTags = (page: IArticle) => {
      if (page.tags !== undefined) {
        tags.value = page.tags;
      } else {
        tags.value = [];
      }
    };
    useFetch(async () => {
      page.value = (await fetchPage()) as IArticle;
      series.value = page.value.series;
      updateTags(page.value);
      const { createdAt, updatedAt } = readDateInfos(page.value);
      if (createdAt.toString() === updatedAt.toString()) {
        updateDateStrings(createdAt, '公開');
      } else {
        updateDateStrings(updatedAt, '更新');
      }
      setBlogpostMeta(page.value);
    });

    watch(page, (value) => {
      if (value !== undefined) {
        setBlogpostMeta(value);
      }
    });

    onMounted(async () => {
      window.$nuxt.$on('content:update', async () => {
        page.value = (await fetchPage()) as IArticle;
        series.value = page.value.series;
        updateTags(page.value);
        setBlogpostMeta(page.value);
      });
    });

    return { page, displayDateString, dateString, publishStatus, pagePath, series, tags };
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
