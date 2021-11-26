<template>
  <div>
    <h3>{{ skillCategoryGroup.category }}</h3>

    <ul>
      <li v-for="skill in skillCategoryGroup.skills" :key="skill.name">
        <skill-panel :skill="skill" />
      </li>
    </ul>

    <div></div>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType } from '#app';
import SkillPanel from '@/components/atoms/SkillPanel.vue';

export default defineNuxtComponent({
  name: 'skill-category-group',
  components: { SkillPanel },
  props: {
    skillCategoryGroup: {
      type: Object as PropType<{
        category: string;
        skillks: Array<{ name: string; icon: string; content: string }>;
      }>,
      required: true,
    },
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
ul {
  display: grid;
  gap: 0.3em;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  padding: 0;
  li {
    display: block;
    list-style: none;
  }
}
</style>
