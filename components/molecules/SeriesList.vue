<template>
  <content-list>
    <li v-for="series in serieses" :key="series.name">
      <series-list-entry :series="series" />
    </li>
  </content-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import ContentList from '@/components/atoms/ContentList.vue';
import { ISeries } from '@/composables/stores/Series';
import SeriesListEntry from '@/components/atoms/SeriesListEntry.vue';

export default defineComponent({
  components: { ContentList, SeriesListEntry },
  props: {
    serieses: {
      type: Array as PropType<Array<ISeries>>,
      required: true,
    },
  },
  setup() {},
});
</script>
