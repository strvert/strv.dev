<template>
  <section class="wrapper">
    <div>
      <nuxt-link :title="prevTitle" class="button" :to="prevSlug" v-if="existPrev"
        >＜＜ PREV</nuxt-link
      >
    </div>
    <div>
      <nuxt-link :title="nextTitle" class="button" :to="nextSlug" v-if="existNext"
        >NEXT ＞＞</nuxt-link
      >
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, useFetch, ref, watch, useContext } from '@nuxtjs/composition-api';
import { IArticle } from '@/composables/stores/Article';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';

export default defineComponent({
  props: {
    path: {
      type: String,
      required: true,
    },
    useSeries: {
      type: Boolean,
      default: false,
    },
    series: {
      type: String,
    },
  },
  setup(props) {
    const { $content } = useContext();

    const fetchSurroundPage = async () => {
      const pop = $content(process.env.articlesPath as string, { deep: true });
      if (props.useSeries && props.series === undefined) {
        return [null, null];
      }
      const samples = props.useSeries ? pop.where({ series: { $eq: props.series } }) : pop;

      const content = samples
        .sortBy('seriesIndex', 'asc')
        .only(['title', 'path'])
        .surround(props.path);

      return await content.fetch();
    };

    const prevTitle = ref('');
    const nextTitle = ref('');
    const existPrev = ref(false);
    const existNext = ref(false);
    const prevSlug = ref('');
    const nextSlug = ref('');

    const update = async () => {
      const pages = (await fetchSurroundPage()) as IArticle[];
      existPrev.value = pages[0] !== null;
      existNext.value = pages[1] !== null;

      if (existPrev.value) {
        prevTitle.value = pages[0].title;
        prevSlug.value = '/blog/' + pathToSlug(pages[0].path);
      }
      if (existNext.value) {
        nextTitle.value = pages[1].title;
        nextSlug.value = '/blog/' + pathToSlug(pages[1].path);
      }
    };
    useFetch(update);

    watch(
      () => props.series,
      async () => {
        await update();
      }
    );

    return { prevTitle, nextTitle, existPrev, existNext, prevSlug, nextSlug };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
}

.button {
  display: block;
}
</style>
