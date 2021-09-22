<template>
  <redirector to="/blog" :wait="5000">
    <template #message> <span>COMING</span> <span>SOON....</span> </template>
    <template #submessage="slotProps">
      <span>トップページはまだ作成されていません。</span
      ><span v-if="slotProps.redirect"
        >{{ slotProps.remaining }}秒後に<nuxt-link to="/blog">ブログページ</nuxt-link
        >へ自動で移動します。</span
      >
    </template>
  </redirector>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '@nuxtjs/composition-api';
import Redirector from '@/components/atoms/Redirector.vue';

export default defineComponent({
  head: {},
  components: { Redirector },
  setup() {
    useMeta({ titleTemplate: 'strv.dev' });
  },
});
</script>

<style lang="scss" scoped>
</style>

<!--
<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  useContext,
  useAsync,
  useFetch,
  onMounted,
} from '@nuxtjs/composition-api';
import { IContentDocument } from '@nuxt/content/types/content';

interface IArticleContent extends IContentDocument {
  title: string;
  description: string;
}

export default defineComponent({
  setup(props) {
    const { $content } = useContext();
    const fetchPage = async () => {
      return await $content('home').fetch();
    };
    const page = useAsync(fetchPage);

    onMounted(() => {
      window.$nuxt.$on('content:update', async () => {
        page.value = await fetchPage();
      });
    });

    return { page };
  },
});
</script>
-->
