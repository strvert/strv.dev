import { ref, Ref, useNuxtApp, onMounted, onBeforeUnmount } from '#app';
import { useFetch } from '@nuxtjs/composition-api';
import { SearchParam } from '@/composables/utils/SearchParam';
import { IArticle } from '@/composables/stores/Article';

interface sortProp {
  by: string;
  direction: 'asc' | 'desc';
}

export const useSearchBlogContent = (
  param: SearchParam = {},
  sort: sortProp = { by: 'createdAt', direction: 'desc' }
) => {
  const { $content } = useNuxtApp();
  const pages: Ref<IArticle[]> = ref<IArticle[]>([]);

  const makeWhereParam = () => {
    return {
      tags: (() => {
        if (param.tags !== undefined) {
          return { $contains: param.tags };
        } else {
          return undefined;
        }
      })(),
      series: (() => {
        if (param.series !== undefined) {
          return { $eq: param.series };
        } else {
          return undefined;
        }
      })(),
    };
  };

  const fetchPages = async () => {
    const pages = (await $content(process.env.articlesPath!, { deep: true })
      .sortBy(sort.by, sort.direction)
      .where(makeWhereParam())
      .fetch<IArticle>()) as IArticle[];
    if (Array.isArray(pages)) {
      return pages;
    }
    return [];
  };

  useFetch(async () => {
    pages.value = await fetchPages();
  });

  onMounted(async () => {
    window.$nuxt.$on('content:update', async () => {
      pages.value = await fetchPages();
    });
  });

  onBeforeUnmount(async () => {
    window.$nuxt.$off('content:update');
  });

  return { pages };
};
