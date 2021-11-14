import { ref, Ref, useNuxtApp, onMounted, onBeforeUnmount, watch } from '#app';
import { useAsync } from '@nuxtjs/composition-api';
import { ParamBuilder } from '@/composables/utils/SearchParamBuilder/SearchParamBuilder';
import { SearchParam } from '@/composables/utils/SearchParam';
import { IArticle } from '@/composables/stores/Article';

interface sortProp {
  by: string;
  direction: 'asc' | 'desc';
}

export const useSearchBlogContent = (
  paramBuilder: ParamBuilder,
  sort: sortProp = { by: 'createdAt', direction: 'desc' }
) => {
  const { $content } = useNuxtApp();
  const pages: Ref<IArticle[]> = ref<IArticle[]>([]);
  const completed = ref<boolean>(false);
  const param = ref<SearchParam>({});

  const updateParameter = () => {
    param.value = paramBuilder.update();
  };

  const makeWhereParam = () => {
    return {
      tags: (() => {
        if (param.value.tags !== undefined) {
          return { $contains: param.value.tags };
        } else {
          return undefined;
        }
      })(),
      series: (() => {
        if (param.value.series !== undefined) {
          return { $eq: param.value.series };
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

  const fetch = async () => {
    updateParameter();
    pages.value = await fetchPages();
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
