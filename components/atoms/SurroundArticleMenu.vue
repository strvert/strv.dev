<template>
  <section class="wrapper">
    <div class="prev button">
      <nuxt-link :title="prevTitle" :to="prevSlug" v-if="existPrev">＜＜ PREV</nuxt-link>
    </div>
    <div class="seriesname button">
      <nuxt-link :title="seriesTitle" :to="`/blog/series/${seriesTitle}`" v-if="useSeries">
        {{ seriesTitle }}
      </nuxt-link>
    </div>
    <div class="next button">
      <nuxt-link :title="nextTitle" :to="nextSlug" v-if="existNext">NEXT ＞＞</nuxt-link>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  useFetch,
  ref,
  watch,
  computed,
  useContext,
} from '@nuxtjs/composition-api';
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

    const seriesTitle = computed(() => {
      return props.series;
    });

    const prevTitle = ref('');
    const nextTitle = ref('');
    const existPrev = ref(false);
    const existNext = ref(false);
    const prevSlug = ref('');
    const nextSlug = ref('');
    const seriesPage = ref('');

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

    return {
      prevTitle,
      nextTitle,
      existPrev,
      existNext,
      prevSlug,
      nextSlug,
      seriesTitle,
      seriesPage,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  gap: 0.5rem;
  grid-template-columns: minmax(max-content, auto) auto minmax(max-content, auto);
  align-items: center;

  .prev {
    justify-self: flex-start;
  }
  .seriesname {
    text-align: center;
  }
  .next {
    margin-inline-start: auto;
    text-align: right;
  }
}

.button {
  display: block;
}
</style>
