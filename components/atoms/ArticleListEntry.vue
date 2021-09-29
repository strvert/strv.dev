<template>
  <article>
    <div>
      <img class="tagicon" :src="iconPath" />
    </div>
    <header>
      <nuxt-link :to="uri"
        ><h1>{{ title }}</h1></nuxt-link
      >
      <div class="meta">
        <div class="pubtime">
          <publish-time
            :published="published"
            :updated="updated"
            :iconStyle="{ 'font-size': '1.06rem' }"
          />
        </div>
        <div class="taglist">
          <tag-list
            :tags="tags"
            :listStyle="{ 'font-size': '0.96rem' }"
            :iconStyle="{ 'font-size': '1.06rem' }"
          ></tag-list>
        </div>
      </div>
    </header>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api';
import TagList from '@/components/atoms/TagList.vue';
import PublishTime from '@/components/atoms/PublishTime.vue';
import { Moment } from 'moment-timezone';

export default defineComponent({
  components: { TagList, PublishTime },
  props: {
    tags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    published: {
      type: Object as PropType<Moment>,
      required: true,
    },
    updated: {
      type: Object as PropType<Moment>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const iconPath = ref(
      (() => {
        const { $repositories } = useContext();
        const { tagIcon } = $repositories;
        if (props.tags.length !== 0) {
          const icon = tagIcon.getIcon(props.tags[0]);
          if (icon !== undefined) {
            return icon.path;
          }
        }
        return tagIcon.getDefaultIcon().path;
      })()
    );
    return { iconPath };
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
      margin: 0;
      @media screen and (max-width: 500px) {
        font-size: 1.05em;
      }
    }
  }

  .tagicon {
    background-color: var(--strvdev-blogpost-code);
    border-radius: 10px;
    block-size: 2.9rem;
    padding: 5px;
  }

  .meta {
    display: flex;
    gap: 1.1em;
    align-content: center;
    align-items: start;
    line-height: 1em;
    .pubtime {
      min-inline-size: 7em;
    }
  }
}
</style>
