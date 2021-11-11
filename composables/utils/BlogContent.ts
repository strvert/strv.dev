import { ref, useNuxtApp, onMounted, onBeforeUnmount } from '#app';
import { useFetch } from '@nuxtjs/composition-api';
import { slugToPath } from '@/composables/utils/ConvertArticlePath';
import { IArticle } from '@/composables/stores/Article';

export const useBlogContent = (slug: string) => {
  const page = ref<IArticle>();
  const tags = ref<string[]>([]);
  const series = ref<string>();

  const { $content } = useNuxtApp();
  const path = ref(slugToPath(slug));

  const fetchPage = async () => {
    const p = await $content(path.value).fetch();
    if (Array.isArray(p)) {
      return p[0];
    }
    return p;
  };
  const updateTags = (page: IArticle) => {
    if (page.tags !== undefined) {
      tags.value = page.tags;
    } else {
      tags.value = [];
    }
  };

  useFetch(async () => {
    page.value = (await fetchPage()) as IArticle;
    series.value = page.value.series;
    updateTags(page.value);
  });

  onMounted(async () => {
    window.$nuxt.$on('content:update', async () => {
      page.value = (await fetchPage()) as IArticle;
      series.value = page.value.series;
      updateTags(page.value);
    });
  });

  onBeforeUnmount(async () => {
    window.$nuxt.$off('content:update');
  });

  return { page, path, series, tags };
};
