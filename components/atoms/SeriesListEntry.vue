<template>
  <content-list-entry
    :title="series.name"
    :uri="`/blog/series/${encodeURIComponent(series.name)}`"
    :iconPath="iconPath"
  >
  </content-list-entry>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, useNuxtApp } from '#app';
import { ISeries } from '@/composables/stores/Series';
import TagList from '@/components/atoms/TagList.vue';
import PublishTime from '@/components/atoms/PublishTime.vue';
import ContentListEntry from '@/components/atoms/ContentListEntry.vue';

export default defineComponent({
  components: { TagList, PublishTime, ContentListEntry },
  props: {
    series: {
      type: Object as PropType<ISeries>,
      required: true,
    },
  },
  setup(props) {
    const iconPath = computed(() => {
      const { $repositories } = useNuxtApp();
      const { icons } = $repositories;
      const icon = icons.getIcon(props.series.icon);
      if (icon === undefined) {
        return icons.getDefaultIcon().path;
      }
      return icon.path;
    });
    return { iconPath };
  },
});
</script>

<style lang="scss" scoped>
.meta {
  display: flex;
  gap: 1.1em;
  align-content: center;
  align-items: flex-start;
  line-height: 1em;
  .pubtime {
    min-inline-size: 7em;
  }
}
</style>
