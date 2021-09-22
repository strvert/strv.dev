<template>
  <div>
    <article>
      <div class="blogpost">
        <header>
          <h1 class="post-title">{{ page === undefined ? '' : page.title }}</h1>
          <p class="publish-time">
            <time :datetime="dateString">{{ displayDateString }}</time
            >に{{ publishStatus }}
          </p>
        </header>
        <nuxt-content :document="page" />
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useMeta,
  useFetch,
  ref,
  useContext,
  onMounted,
} from '@nuxtjs/composition-api';
import { IArticle, PublishStatus } from '@/composables/stores/Article';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';
import { Moment } from 'moment-timezone';

export default defineComponent({
  head: {},
  props: {},
  setup() {
    useMeta({ title: 'blog' });
    const { route, $content } = useContext();
    const pageParam = route.value.params.blogpost;

    const fetchPage = async () => {
      return await $content('articles/' + pageParam).fetch();
    };
    const page = ref<IArticle>();
    const displayDateString = ref<string>();
    const dateString = ref<string>();
    const publishStatus = ref<PublishStatus>();
    const updateDateStrings = (at: Moment, status: PublishStatus) => {
      displayDateString.value = at.format('YYYY.MM.DD');
      dateString.value = at.format();
      publishStatus.value = status;
    };
    useFetch(async () => {
      page.value = (await fetchPage()) as IArticle;
      const { createdAt, updatedAt } = readDateInfos(page.value);
      if (createdAt.toString() === updatedAt.toString()) {
        updateDateStrings(createdAt, '公開');
      } else {
        updateDateStrings(updatedAt, '更新');
      }
    });

    onMounted(async () => {
      window.$nuxt.$on('content:update', async () => {
        page.value = (await fetchPage()) as IArticle;
      });
    });

    return { page, displayDateString, dateString, publishStatus };
  },
});
</script>

<style lang="scss" scoped>
.blogpost {
  > header {
    > .post-title {
      font-size: 2rem;
      margin-block-end: 1rem;
    }
    > .publish-time {
      font-size: 0.95rem;
      color: #00000088;
      margin: 0;
    }
  }
}
</style>
