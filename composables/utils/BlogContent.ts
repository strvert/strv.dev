import { ref, useNuxtApp, onMounted, onBeforeUnmount } from '#app';
import { useFetch } from '@nuxtjs/composition-api';
import { slugToPath } from '@/composables/utils/ConvertArticlePath';
import { IArticle } from '@/composables/stores/Article';

export const useBlogContent = (slug: string, setMeta: boolean = false) => {
  const page = ref<IArticle>();

  const { $content } = useNuxtApp();
  const path = ref(slugToPath(slug));

  const fetchPage = async () => {
    const p = await $content(path.value).fetch();
    if (Array.isArray(p)) {
      return p[0];
    }
    return p;
  };

  const fetch = async () => {
    page.value = (await fetchPage()) as IArticle;
    return { page, path };
  };

  onMounted(async () => {
    window.$nuxt.$on('content:update', async () => {
      await fetch();
    });
  });

  onBeforeUnmount(async () => {
    window.$nuxt.$off('content:update');
  });

  return { page, path, fetch };
};
