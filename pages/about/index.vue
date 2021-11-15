<template>
  <blogpost-frame :page="page" :showComment="false">
    <nuxt-content :document="page" />
  </blogpost-frame>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxtApp, useNuxt2Meta, ref } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import { useFetch } from '@nuxtjs/composition-api';
import { IArticle } from '@/composables/stores/Article';

export default defineNuxtComponent({
  name: 'about',
  components: { BlogpostFrame },
  setup() {
    useNuxt2Meta({ title: '当サイトについて' });
    const { $content } = useNuxtApp();
    const page = ref(undefined);

    useFetch(async () => {
      const p = await $content('about').fetch<IArticle[]>();
      page.value = p;
    });

    return { page };
  },
});
</script>
