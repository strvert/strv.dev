import { ref, onMounted, useNuxtApp, onBeforeUnmount } from '#app';
import { useFetch } from '@nuxtjs/composition-api';
import { IArticle } from '@/composables/stores/Article';
import { ISeries } from '@/composables/stores/Series';

export const useBlogSeries = () => {
  const serieses = ref<Array<ISeries>>([]);
  const { $content } = useNuxtApp();

  const fetchSerieses = async () => {
    const pages = (await $content(process.env.articlesPath!, {
      deep: true,
    }).fetch<IArticle>()) as IArticle[];
    const seriesSet = pages
      .filter((page) => page.series !== undefined)
      .reduce((prev, curr) => prev.add(curr.series!), new Set<string>());

    return await Promise.all(
      Array.from(seriesSet.values()).map(async (name) => {
        const pages = (await $content(process.env.articlesPath!, { deep: true })
          .where({ series: { $eq: name } })
          .fetch<IArticle>()) as IArticle[];
        const icon = (() => {
          if (pages.length === 0) {
            return '';
          } else {
            if (pages[0].tags === undefined || pages[0].tags.length === 0) {
              return '';
            } else {
              return pages[0].tags[0];
            }
          }
        })();
        return { name: name, contents: pages, icon } as ISeries;
      })
    );
  };

  useFetch(async () => {
    serieses.value = await fetchSerieses();
  });

  onMounted(async () => {
    window.$nuxt.$on('content:update', async () => {
      serieses.value = await fetchSerieses();
    });
  });

  onBeforeUnmount(async () => {
    window.$nuxt.$off('content:update');
  });

  return { serieses };
};
