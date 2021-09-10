<template>
  <div>
    <nuxt-content :document="page" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  useContext,
  useAsync,
  useFetch,
  onMounted,
} from '@nuxtjs/composition-api';
import { IContentDocument } from '@nuxt/content/types/content';

interface IArticleContent extends IContentDocument {
  title: string;
  description: string;
}

export default defineComponent({
  setup(props) {
    const { $content } = useContext();
    const fetchPage = async () => {
      return await $content('home').fetch();
    };
    const page = useAsync(fetchPage);

    onMounted(() => {
      window.$nuxt.$on('content:update', async () => {
        page.value = await fetchPage();
      });
    });

    return { page };
  },
});
</script>
