<template>
  <div class="wrapper">
    <div v-if="!isUpdated" class="published-time time">
      <span class="material-icons" :style="iconStyle"> event </span>
      <time>{{ pub }}</time>
    </div>
    <div v-else class="updated-time time">
      <span class="material-icons" :style="iconStyle"> update </span>
      <time>{{ up }}</time>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from '@nuxtjs/composition-api';
import { Moment } from 'moment-timezone';

export default defineComponent({
  props: {
    published: {
      type: Object as PropType<Moment>,
      required: true,
    },
    updated: {
      type: Object as PropType<Moment>,
      required: true,
    },
    iconStyle: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    const isUpdated = ref(props.published.toString() === props.updated.toString());

    const pub = computed(() => {
      return props.published.format('YYYY.MM.DD');
    });
    const up = computed(() => {
      if (props.updated === undefined) {
        return undefined;
      }
      return props.updated.format('YYYY.MM.DD');
    });

    return { pub, up, isUpdated };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  gap: 1em;

  .time {
    display: flex;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    opacity: 0.7;
  }
}
</style>
