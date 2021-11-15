<template>
  <blogpost-frame v-if="page !== undefined" :page="page" :showComment="false">
    <nuxt-content :document="page" />
  </blogpost-frame>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxtApp, useNuxt2Meta, ref } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import { useFetch } from '@nuxtjs/composition-api';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';
import { IArticle } from '@/composables/stores/Article';

export default defineNuxtComponent({
  name: 'about',
  components: { BlogpostFrame },
  setup() {
    const { $content } = useNuxtApp();
    const page = ref(undefined);
    const { makeBlogpostMeta } = useBlogpostMeta();
    const { title, meta } = makeBlogpostMeta(page, 'main.png');
    useNuxt2Meta({ title, meta });

    useFetch(async () => {
      const p = await $content('about').fetch<IArticle[]>();
      page.value = p;
    });

    return { page };
  },
});
</script>
