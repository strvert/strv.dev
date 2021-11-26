<template>
  <section>
    <h2>スキルセット</h2>
    <p>色んなものを触りまくってきましたが、すこしだけちゃんと触れたものを選んで並べてみました。</p>

    <div v-for="cg in SkillSets" :key="cg.category">
      <skill-category-group :skillCategoryGroup="cg" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType } from '#app';
import SkillCategoryGroup from '@/components/atoms/SkillCategoryGroup.vue';

import SkillSets from '@/assets/json/profiles/skills.json';

export default defineNuxtComponent({
  name: 'skill-profile',
  components: { SkillCategoryGroup },
  setup() {
    return { SkillSets };
  },
});
</script>

<style lang="scss" scoped>
p {
  transition: inherit;
}
</style>
