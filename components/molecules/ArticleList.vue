<template>
  <content-list>
    <li v-for="article in articles" :key="article.path">
      <article-list-entry :article="article" />
    </li>
  </content-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import ContentList from '@/components/atoms/ContentList.vue';
import ArticleListEntry from '@/components/atoms/ArticleListEntry.vue';
import { IArticle } from '@/composables/stores/Article';

export default defineComponent({
  components: { ContentList, ArticleListEntry },
  props: {
    articles: {
      type: Array as PropType<Array<IArticle>>,
      required: true,
    },
  },
  setup() {},
});
</script>
