<template>
  <div>
    <article>
      <div class="blogpost">
        <header>
          <h1 class="post-title">{{ page !== undefined ? page.title : '' }}</h1>
          <div class="post-info-wrapper">
            <div class="tag-list">
              <tag-list :tags="page !== undefined ? page.tags : []" />
            </div>
            <p class="publish-time">
              <time :datetime="dateString">{{ dateString }}</time
              >に{{ pubStatus }}
            </p>
          </div>
        </header>
        <slot />
      </div>
    </article>
    <div class="surround-menu">
      <surround-article-menu
        :path="path"
        :useSeries="true"
        :series="page !== undefined ? page.series : ''"
      />
    </div>
    <article v-if="showComment" class="giscus-wrapper">
      <giscus />
    </article>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType, computed } from '#app';
import { IArticle } from '@/composables/stores/Article';
import TagList from '@/components/atoms/TagList.vue';
import SurroundArticleMenu from '@/components/atoms/SurroundArticleMenu.vue';
import Giscus from '@/components/atoms/Giscus.vue';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';

export default defineNuxtComponent({
  components: { Giscus, TagList, SurroundArticleMenu },
  props: {
    page: {
      type: Object as PropType<IArticle>,
      required: true,
    },
    path: {
      type: String,
      default: '',
    },
    tags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return new Array();
      },
    },
    showComment: {
      type: Boolean,
      default: true,
   }
  },
  setup(props) {
    const dateString = computed(() => {
      if (props.page !== undefined) {
        const { createdAt, updatedAt } = readDateInfos(props.page);
        const at = createdAt.toString() === updatedAt.toString() ? createdAt : updatedAt;
        return at.format('YYYY.MM.DD');
      } else {
        return '';
      }
    });
    const pubStatus = computed(() => {
      if (props.page !== undefined) {
        const { createdAt, updatedAt } = readDateInfos(props.page);
        return createdAt.toString() === updatedAt.toString() ? '公開' : '更新';
      } else {
        return '';
      }
    });

    return { dateString, pubStatus };
  },
});
</script>

<style lang="scss" scoped>
.giscus-wrapper {
  max-inline-size: 820px;
  padding-block-start: 1rem;
  @media screen and (max-width: 820px) {
    max-inline-size: 800px;
  }
  margin: 0 auto;
}

.surround-menu {
  display: block;
  margin-block-start: 4rem;
}

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
</style>