<template>
  <div>
    <article>
      <div class="blogpost">
        <nuxt-content :document="page" />
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useMeta,
  useAsync,
  ref,
  Ref,
  useContext,
  onMounted,
} from '@nuxtjs/composition-api';
import { IContentDocument } from '@nuxt/content/types/content';

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
    const page = useAsync(fetchPage) as Ref<IContentDocument>;

    onMounted(() => {
      window.$nuxt.$on('content:update', async () => {
        page.value = (await fetchPage()) as IContentDocument;
      });
    });

    return { page };
  },
});
</script>

<style lang="scss" scoped>
.blogpost {
  max-inline-size: 700px;
  min-inline-size: 350px;
  margin: 0 auto;

  @media screen and (max-width: 700px) {
    margin-left: 10px;
    margin-right: 10px;
  }
}
</style>
