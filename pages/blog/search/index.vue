<template>
  <div>
    <content-list-container listTitle="検索結果">
      <article-list :articles="pages" />
    </content-list-container>
    <!--<button @click="event">button</button>-->
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute, useNuxt2Meta, ref } from '#app';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import ArticleList from '@/components/molecules/ArticleList.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';
import { URLParamBuilder } from '@/composables/utils/SearchParamBuilder/URLParamBuilder';
import { IArticle } from '@/composables/stores/Article';
import { SearchParam } from '@/composables/utils/SearchParam';

export default defineNuxtComponent({
  name: 'search',
  components: {
    ContentListContainer,
    ArticleList,
  },
  setup() {
    const route = ref(useRoute());
    useNuxt2Meta({ title: '記事検索' });
    const makeParam = (): SearchParam => {
      return {
        tags: [route.value.query.t],
      };
    };

    const { pages } = useSearchBlogContent(new URLParamBuilder());
    return { pages };
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
