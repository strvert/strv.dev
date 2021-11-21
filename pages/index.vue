<template>
  <!--<redirector to="/blog" :wait="5000">
    <template #message> <span>COMING</span> <span>SOON....</span> </template>
    <template #submessage="slotProps">
      <span>トップページはまだ作成されていません。</span
      ><span v-if="slotProps.redirect"
        >{{ slotProps.remaining }}秒後に<nuxt-link to="/blog">ブログページ</nuxt-link
        >へ自動で移動します。</span
      >
    </template>
  </redirector>-->
  <top-large-logo />
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import Redirector from '@/components/atoms/Redirector.vue';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';

export default defineNuxtComponent({
  components: { Redirector, TopLargeLogo },
  setup() {
    useNuxt2Meta({ titleTemplate: 'strv.dev' });
  },
});
</script>

