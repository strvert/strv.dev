<template>
  <content-list-frame listTitle="シリーズ一覧" :ready="completed">
    <series-list :serieses="serieses" />
  </content-list-frame>
</template>

<script lang="ts">
import { defineComponent, useNuxt2Meta } from '#app';
import SeriesList from '@/components/molecules/SeriesList.vue';
import ContentListFrame from '@/components/molecules/ContentListFrame.vue';
import { useBlogSeries } from '@/composables/utils/BlogSeries';

export default defineComponent({
  components: { ContentListFrame, SeriesList },
  setup() {
    useNuxt2Meta({ title: 'シリーズ一覧' });
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
