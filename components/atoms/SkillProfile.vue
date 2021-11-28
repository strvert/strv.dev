<template>
  <section>
    <h2>スキルセット</h2>
    <p>
      好奇心につられて色んなものを触りまくってきました。ここではスキルと言えそうなものを選んで並べてみました。
    </p>

    <div v-for="cg in SkillSets" :key="cg.category">
      <skill-category-group :skillCategoryGroup="cg" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
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
