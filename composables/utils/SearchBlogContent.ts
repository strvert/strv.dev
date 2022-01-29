import { ref, Ref, useNuxtApp, onMounted, onBeforeUnmount, watch } from '#app';
import { useAsync } from '@nuxtjs/composition-api';
import { ParamBuilder } from '@/composables/utils/SearchParamBuilder/SearchParamBuilder';
import { SearchParam } from '@/composables/utils/SearchParam';
import { IArticle } from '@/composables/stores/Article';

interface SortProp {
  by: string;
  direction: 'asc' | 'desc';
}

const makeWhereParam = (param: SearchParam) => {
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

export const useSearchBlogContent = (
  paramBuilder: ParamBuilder,
  sort: SortProp = { by: 'createdAt', direction: 'desc' }
) => {
  const { $content } = useNuxtApp();
  const pages: Ref<IArticle[]> = ref<IArticle[]>([]);
  const completed = ref<boolean>(false);
  const param = ref<SearchParam>({});

  const updateParameter = () => {
    param.value = paramBuilder.update();
  };

  const fetchPages = async (param: SearchParam, sort: SortProp) => {
    const pages = (await $content(process.env.articlesPath!, { deep: true })
      .sortBy(sort.by, sort.direction)
      .where(makeWhereParam(param))
      .fetch<IArticle>()) as IArticle[];
    if (Array.isArray(pages)) {
      return pages;
    }
    return [];
  };

  const fetch = async () => {
    updateParameter();
    pages.value = await fetchPages(param.value, sort);
    completed.value = true;
  };

  useAsync(async () => {
    await fetch();
  });

  onMounted(async () => {
    watch(
      () => window.$nuxt.$route.query,
      async () => {
        completed.value = false;
        await fetch();
      }
    );
    window.$nuxt.$on('content:update', async () => {
      await fetch();
    });
  });

  onBeforeUnmount(async () => {
    window.$nuxt.$off('content:update');
  });

  return { pages, completed };
};

export const searchContentLegacy = async (
  paramBuilder: ParamBuilder,
  $content: any,
  sort: SortProp = { by: 'createdAt', direction: 'desc' }
) => {
  const param: SearchParam = paramBuilder.update();
  const pages = (await $content(process.env.articlesPath!, { deep: true })
    .sortBy(sort.by, sort.direction)
    .where(makeWhereParam(param))
    .fetch<IArticle>()) as IArticle[];

  return { pages: ref(Array.isArray(pages) ? pages : []), computed: ref(true) };
};
