import { ref, watch } from '#app';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';

export const useBlogpostMeta = () => {
  const makeBlogpostMeta = (article: ref<IArticle>) => {
    const title = ref('');
    const meta = ref([]);
    watch(article, (value: IArticle) => {
      if (value !== undefined) {
        title.value = value.title;
        meta.value = [
          {
            hid: 'description',
            name: 'description',
            content: value.description,
          },
          {
            hid: 'og:description',
            property: 'og:description',
            content: value.description,
          },
          {
            hid: 'og:url',
            property: 'og:url',
            content: `${process.env.baseUrl}/${process.env.articlesRoute}/${pathToSlug(
              value.path
            )}`,
          },
          {
            hid: 'og:title',
            property: 'og:title',
            content: `${value.title} - ${process.env.siteName}`,
          },
          {
            hid: 'og:image',
            property: 'og:image',
            content: `${process.env.ogpImages}/generated/${pathToSlug(value.path)}.png`,
          },
        ];
      }
    });

    return { title, meta };
  };
  return { makeBlogpostMeta };
};
