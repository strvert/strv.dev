<template>
  <section>
    <header>
      <h1>記事一覧</h1>
    </header>

    <div>
      <article-list :articles="pages" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '@nuxtjs/composition-api';
import ArticleList from '@/components/molecules/ArticleList.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';

export default defineComponent({
  head: {},
  components: { ArticleList },
  setup() {
    useMeta({ title: 'blog' });
    const { pages } = useSearchBlogContent();
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
