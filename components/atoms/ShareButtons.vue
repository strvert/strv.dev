<template>
  <section>
    <h2>share</h2>
    <ul class="share-list">
      <li>
        <a :href="`https://twitter.com/share?
url=${baseUrl}${url}&
text=${text}&
via=strvert`"
            rel="nofollow"
            target="_blank"
            >
          <span class="im icon">&#xe0a7</span>
        </a>
      </li>
      <li>
        <a :href="`http://www.facebook.com/share.php?u=${baseUrl}${url}`" rel="nofollow" target="_blank">
          <span class="im icon">&#xe0a5</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, useNuxtApp, ref } from '#app';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      baseUrl: process.env.baseUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
h2 {
  display: none;
}

.share-list {
  list-style: none;
  padding: 0;
  margin-inline-end: 0.5rem;

  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  a {
    color: var(--strvdev-palette-3);
  }
}
</style>
