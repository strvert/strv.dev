<template>
  <content-list-container listTitle="シリーズ一覧">
    <series-list :serieses="serieses" />
  </content-list-container>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '@nuxtjs/composition-api';
import SeriesList from '@/components/molecules/SeriesList.vue';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useBlogSeries } from '@/composables/utils/BlogSeries';

export default defineComponent({
  head: {},
  components: { ContentListContainer, SeriesList },
  setup() {
    useMeta({ title: 'blog' });
    const { serieses } = useBlogSeries();
    return { serieses };
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
