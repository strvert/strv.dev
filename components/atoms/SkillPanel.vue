<template>
  <article class="skill-panel">
    <header>
      <lazy-load-image class="img" :src="skill.icon" :alt="`${skill.name} icon image`" />
    </header>
    <div class="desc">
      <p class="name">{{ skill.name }}</p>
      <p class="comment">{{ skill.content }}</p>
    </div>
  </article>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType } from '#app';
import LazyLoadImage from '@/components/atoms/LazyLoadImage.vue';

export default defineNuxtComponent({
  name: 'skill-panel',
  components: { LazyLoadImage },
  props: {
    skill: {
      type: Object as PropType<{ name: string; icon: string; content: string }>,
      required: true,
    },
    color: {
      type: String,
      default: '#7ac292',
    },
  },
});
</script>

<style lang="scss" scoped>
article {
  background-color: var(--strvdev-palette-1);
  border: {
    style: solid;
    width: 2px;
    color: #505464;
  }

  padding: 0.2em;
  padding-block-start: 0.9em;
  border-radius: 2px;
  block-size: 100%;
  display: relative;

  header {
    block-size: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    .img {
      display: block;
      inline-size: 3.8em;
      margin-block-end: 0.5em;
    }
  }

  .desc {
    display: absolute;
    bottom: 0;

    p {
      margin: 0;
    }

    .name {
      font-weight: 600;
      margin-block-end: 0.3em;
    }

    .comment {
      font-size: 0.82em;
      margin-block-end: 0.3em;
      word-break: break-all;
      text-align: justify;
    }
    padding: 0 0.2em;
    margin-block-end: 0.3em;
  }
}
</style>
