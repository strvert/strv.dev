import { ref, Ref, watch, useNuxt2Meta } from '#app';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';

export const useBlogpostMeta = () => {
  const title = ref('');
  const meta = ref([]);
  useNuxt2Meta({ title, meta });
  const update = (article: IArticle, ogpImage: String) => {
    if (article === undefined) return;
    const imagePath =
      ogpImage !== ''
        ? `${process.env.ogpImages}/${ogpImage}`
        : `${process.env.ogpImages}/generated/${pathToSlug(article.path)}.png`;
    meta.value = [
      {
        hid: 'description',
        name: 'description',
        content: article.description,
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: article.description,
      },
      {
        hid: 'og:url',
        property: 'og:url',
        content: `${process.env.baseUrl}/${process.env.articlesRoute}/${pathToSlug(article.path)}`,
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: `${article.title} - ${process.env.siteName}`,
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: imagePath,
      },
    ];
    title.value = article.title;
  };
  const setBlogpostMeta = (article: Ref<IArticle>, ogpImage: String = '') => {
    watch(article, (article: IArticle) => update(article, ogpImage));
    update(article.value, ogpImage);
  };
  return { setBlogpostMeta };
};

export const buildHead = (article: IArticle, ogpImage: String = '') => {
  return {
    get title() {
      return article.title;
    },
    get meta() {
      if (article === undefined) return;
      const imagePath =
        ogpImage !== ''
          ? `${process.env.ogpImages}/${ogpImage}`
          : `${process.env.ogpImages}/generated/${pathToSlug(article.path)}.png`;
      return [
        {
          hid: 'description',
          name: 'description',
          content: article.description,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: article.description,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: `${process.env.baseUrl}/${process.env.articlesRoute}/${pathToSlug(
            article.path
          )}`,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `${article.title} - ${process.env.siteName}`,
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: imagePath,
        },
      ];
    },
  };
};
