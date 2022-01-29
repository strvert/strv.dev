<template>
  <content-list-frame listTitle="記事一覧" :ready="true">
    <article-list :articles="pages.value" />
  </content-list-frame>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';

import ArticleList from '@/components/molecules/ArticleList.vue';
import ContentListFrame from '@/components/molecules/ContentListFrame.vue';

import { StaticParamBuilder } from '@/composables/utils/SearchParamBuilder/StaticParamBuilder';
import { searchContentLegacy } from '@/composables/utils/SearchBlogContent';

export default defineNuxtComponent({
  name: 'blog',
  components: { ContentListFrame, ArticleList },
  head() {
    return { title: '記事一覧' };
  },
  async asyncData(params: any) {
    const { pages, completed } = await searchContentLegacy(
      new StaticParamBuilder({}),
      params.$content
    );
    return { pages, completed };
  },
});
</script>

<style lang="scss" scoped>
h1 {
  @media screen and (max-width: 800px) {
    font-size: 1.4em;
  }
}
</style>
