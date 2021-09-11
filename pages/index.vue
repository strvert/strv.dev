<template>
  <div>
    <header class="redirect-message">
      <h1 class="rounded-font">COMMING SOON......</h1>
      <p class="message">
        <span class="lineblock">トップページはまだ作成されていません。</span
        ><span class="lineblock"
          >5秒後に<nuxt-link to="/blog">ブログページ</nuxt-link>へ自動で移動します。</span
        >
      </p>
    </header>
  </div>
</template>

<script lang="ts">
import { defineComponent, useRouter } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const router = useRouter();
    setTimeout(() => {
      router.push('/blog');
    }, 5000);
  },
});
</script>

<style lang="scss" scoped>
.redirect-message {
  text-align: center;
  inline-size: 100%;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);

  > h1 {
    font-size: 3rem;
  }

  > .message {
    font-size: 1.2rem;

    > .lineblock {
      display: inline;
    }

    @media screen and (max-width: 820px) {
      > .lineblock {
        display: block;
      }
    }
  }
}
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
