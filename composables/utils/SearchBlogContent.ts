import { useFetch, ref, useContext, onMounted, onBeforeUnmount } from '@nuxtjs/composition-api';
import { SearchParam } from '@/composables/utils/SearchParam';
import { IArticle } from '@/composables/stores/Article';

interface sortProp {
  by: string;
  direction: 'asc' | 'desc';
}

export const useSearchBlogContent = (
  param: SearchParam = {},
  sort: sortProp = { by: 'createdAt', direction: 'asc' }
) => {
  const { $content } = useContext();
  const pages = ref<IArticle[]>([]);

  const makeWhereParam = () => {
    if (param.tags !== undefined) {
      return {
        tags: { $contains: param.tags }
      };
    }
    return {};
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
