<template>
  <blogpost-frame v-if="page !== undefined" :page="page" :showComment="false">
    <nuxt-content :document="page" />
  </blogpost-frame>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxtApp, ref } from '#app';
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
    const { setBlogpostMeta } = useBlogpostMeta();

    useFetch(async () => {
      page.value = await $content('about').fetch<IArticle>();
      setBlogpostMeta(page, 'main.png');
      console.log(page.value.title);
    });

    return { page };
  },
});
</script>
