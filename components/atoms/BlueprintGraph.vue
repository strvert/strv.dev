<template>
  <div @mouseenter="disable" @mouseleave="enable" class="outer">
    <div :id="graphId"></div>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, onMounted } from '#app';
import { Graph } from 'blueprint-renderer';
import { useScrollSwitcher } from '@/composables/utils/ScrollSwitcher';

export default defineNuxtComponent({
  name: 'blueprint-graph',
  setup() {
    const graphId = ref(Math.random().toString(32).substring(2));
    onMounted(() => {
      const outer = document.querySelector('.outer') as HTMLDivElement;
      const graph = new Graph(graphId.value, { width: outer.clientWidth - 10, height: 500 });
      const initStage = () => {
        graph.stage.width(outer.clientWidth);
      };
      window.addEventListener('resize', () => initStage());
      initStage();
    });

    const { enable, disable } = useScrollSwitcher();

    return { graphId, enable, disable };
  },
});
</script>

<style lang="scss" scoped>
</style>
