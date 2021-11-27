<template>
  <div>
    <blogpost-frame v-if="page !== undefined" :page="page" :showComment="false">
      <nuxt-content :document="page" />
    </blogpost-frame>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxtApp, ref } from '#app';

import { useAsync } from '@nuxtjs/composition-api';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';
import { IArticle } from '@/composables/stores/Article';

import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';

export default defineNuxtComponent({
  name: 'about',
  components: { TopLargeLogo, BlogpostFrame },
  setup() {
    const { $content } = useNuxtApp();
    const page = ref(undefined);
    const { setBlogpostMeta } = useBlogpostMeta();

    useAsync(async () => {
      page.value = await $content('about').fetch<IArticle>();
      setBlogpostMeta(page, 'main.png');
    });

    return { page };
  },
});
</script>
