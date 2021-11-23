<template>
  <article>
    <div>
      <nuxt-link :to="uri">
        <div class="tagicon-wrapper">
          <lazy-load-image class="tagicon" :src="iconPath" />
        </div>
      </nuxt-link>
    </div>
    <header>
      <nuxt-link :to="uri"
        ><h1>{{ title }}</h1>
      </nuxt-link>
      <slot />
    </header>
  </article>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import TagList from '@/components/atoms/TagList.vue';
import PublishTime from '@/components/atoms/PublishTime.vue';
import LazyLoadImage from '@/components/atoms/LazyLoadImage.vue';

export default defineComponent({
  components: { TagList, PublishTime, LazyLoadImage },
  props: {
    title: {
      type: String,
      required: true,
    },
    iconPath: {
      type: String,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
article {
  display: flex;
  gap: 1rem;
  min-block-size: 6rem;
  @media screen and (max-width: 500px) {
    min-block-size: 5rem;
    .taglist {
      display: none;
    }
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    a {
      color: inherit;
    }
    h1 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      @media screen and (max-width: 500px) {
        font-size: 1.05em;
      }
    }
  }

  .tagicon-wrapper {
    block-size: 2.9rem;
    inline-size: 2.9rem;
    border-radius: 10px;
    background-color: var(--strvdev-blogpost-code);
    padding: 5px;
    .tagicon {
      border-radius: 10px;
      block-size: 100%;
    }
  }
}
</style>
