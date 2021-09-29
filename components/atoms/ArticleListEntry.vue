<template>
  <content-list-entry :title="title" :uri="uri" :iconPath="iconPath">
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
      </div></div
  ></content-list-entry>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api';
import TagList from '@/components/atoms/TagList.vue';
import PublishTime from '@/components/atoms/PublishTime.vue';
import ContentListEntry from '@/components/atoms/ContentListEntry.vue';
import { Moment } from 'moment-timezone';

export default defineComponent({
  components: { TagList, PublishTime, ContentListEntry },
  props: {
    title: {
      type: String,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
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
</style>
