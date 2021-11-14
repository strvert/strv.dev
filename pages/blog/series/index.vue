<template>
  <content-list-container listTitle="シリーズ一覧" :ready="completed">
    <series-list :serieses="serieses" />
  </content-list-container>
</template>

<script lang="ts">
import { defineComponent, useNuxt2Meta } from '#app';
import SeriesList from '@/components/molecules/SeriesList.vue';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useBlogSeries } from '@/composables/utils/BlogSeries';

export default defineComponent({
  components: { ContentListContainer, SeriesList },
  setup() {
    useNuxt2Meta({ title: 'blog' });
    const { serieses, completed } = useBlogSeries();
    return { serieses, completed };
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
