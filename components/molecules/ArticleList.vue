<template>
  <div>
    <ul>
      <li v-for="article in articles" :key="article.path">
        <article-list-entry
          :title="article.title"
          :tags="article.tags"
          :uri="`/blog/${pathToSlug(article.path)}`"
          :published="readDate(article).createdAt"
          :updated="readDate(article).updatedAt"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import ArticleListEntry from '@/components/atoms/ArticleListEntry.vue';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';

export default defineComponent({
  components: { ArticleListEntry },
  props: {
    articles: {
      type: Array as PropType<Array<IArticle>>,
      required: true,
    },
  },
  setup() {
    const readDate = (article: IArticle) => {
      return readDateInfos(article);
    };
    return { pathToSlug, readDate };
  },
});
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
  li {
    margin-block-end: 2em;
  }
}
</style>
