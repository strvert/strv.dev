<template>
  <div>
    <Html lang="ja-JP">
      <Head>
        <Title>hoge</Title>
        <Meta hid="description" name="description" :content="article.description" />
        <Meta hid="og:description" property="og:description" :content="article.description" />
        <Meta hid="og:url" property="og:url" :content="`${baseUrl}/${articleRoute}/${slug}`" />
        <Meta hid="og:title" property="og:title" :content="`${article.title} - ${siteName}`" />
        <Meta
          hid="og:image"
          property="og:image"
          :content="`${ogpImagesLoc}/generated/${slug}.png`"
        />
      </Head>
    </Html>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '#app';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';

export default defineComponent({
  props: {
    article: {
      type: Object as PropType<IArticle>,
      required: true,
    },
  },
  setup(props) {
    const ogpImagesLoc = process.env.ogpImages;
    const baseUrl = process.env.baseURl;
    const articleRoute = process.env.articleRoute;
    const siteName = process.env.siteName;
    const slug = pathToSlug(props.article.path);
    return { baseUrl, articleRoute, siteName, ogpImagesLoc, slug };
  },
});
</script>

