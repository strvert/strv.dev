<template>
  <ul :style="{ 'flex-direction': `${wrap ? 'column' : 'row'}` }">
    <li
      v-for="content in contents"
      :key="content.URI"
      :style="Object.assign({ 'line-height': rowHeight, 'inline-size': `${width}px` }, textStyle)"
    >
      <nuxt-link :to="content.URI">
        {{ content.DisplayName }}
      </nuxt-link>
    </li>
  </ul>
</template>
<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  useContext,
  onBeforeUnmount,
} from '@nuxtjs/composition-api';
import { NavContent } from '@/composables/stores/NavContent';

export default defineComponent({
  props: {
    contents: {
      type: Array as PropType<Array<NavContent>>,
      required: true,
    },
    rowHeight: {
      type: String,
      required: true,
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    textStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const width = 200;
    return { width };
  },
});
</script>

<style lang="scss" scoped>
ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  justify-content: space-around;
  li {
    text-align: center;

    font-size: 1.1rem;
    font-weight: 900;

    transition-property: color, background-color;
    transition-duration: 0.5s;
    a {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      color: rgb(51, 60, 73);
    }

    // &:hover {
    //   background-color: rgb(51, 60, 73);
    //   a {
    //     color: var(--strvdev-palette-1);
    //   }
    // }
  }
}
</style>
