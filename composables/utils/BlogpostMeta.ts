import { useMeta } from '@nuxtjs/composition-api';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';

interface OGPEntry {
  hid: string;
  property: string;
  content: string;
}

interface OGPData {
  locale: OGPEntry;
  site_name: OGPEntry;
  type: OGPEntry;
  url: OGPEntry;
  title: OGPEntry;
  description: OGPEntry;
  image: OGPEntry;
}

export const useBlogpostMeta = () => {
  const { meta, title } = useMeta();
  const setBlogpostMeta = (article: IArticle) => {
    title.value = article.title;
    meta.value = [
      {
        hid: 'description',
        name: 'description',
        content: article.description
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: article.description
      },
      {
        hid: 'og:url',
        property: 'og:url',
        content: `${process.env.baseUrl}/${process.env.articlesRoute}/${pathToSlug(article.path)}`
      },
      { hid: 'og:title', property: 'og:title', content: `${article.title} - ${process.env.siteName}` },
      {
        hid: 'og:image',
        property: 'og:image',
        content: `${process.env.ogpImages}/generated/${pathToSlug(article.path)}.png`
      }
    ];
  };
  return { setBlogpostMeta };
};
