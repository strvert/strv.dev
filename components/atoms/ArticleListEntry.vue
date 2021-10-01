<template>
  <content-list-entry
    :title="article.title"
    :uri="`/blog/${pathToSlug(article.path)}`"
    :iconPath="iconPath"
  >
    <div class="meta">
      <div class="pubtime">
        <publish-time
          :published="readDate(article).createdAt"
          :updated="readDate(article).updatedAt"
          :iconStyle="{ 'font-size': '1.06rem' }"
        />
      </div>
      <div v-if="isSereis" class="series">
        <nuxt-link :to="`/blog/series/${article.series}`">
          <img src="/images/icons/Series.svg" :title="`シリーズ記事 『${article.series}』`" />
        </nuxt-link>
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
import { defineComponent, PropType, ref, useContext, computed } from '@nuxtjs/composition-api';
import TagList from '@/components/atoms/TagList.vue';
import PublishTime from '@/components/atoms/PublishTime.vue';
import ContentListEntry from '@/components/atoms/ContentListEntry.vue';
import { pathToSlug } from '@/composables/utils/ConvertArticlePath';
import { readDateInfos } from '@/composables/utils/ArticleInfoReader';
import { IArticle } from '@/composables/stores/Article';

export default defineComponent({
  components: { TagList, PublishTime, ContentListEntry },
  props: {
    article: {
      type: Object as PropType<IArticle>,
      required: true,
    },
  },
  setup(props) {
    const tags = computed(() => {
      return props.article.tags === undefined ? [] : props.article.tags;
    });
    const iconPath = ref(
      (() => {
        const { $repositories } = useContext();
        const { icons } = $repositories;
        if (tags.value.length !== 0) {
          const icon = icons.getIcon(tags.value[0]);
          if (icon !== undefined) {
            return icon.path;
          }
        }
        return icons.getDefaultIcon().path;
      })()
    );
    const readDate = (article: IArticle) => {
      return readDateInfos(article);
    };

    const isSereis = computed(() => props.article.series !== undefined);
    return { iconPath, pathToSlug, readDate, tags, isSereis };
  },
});
</script>

<style lang="scss" scoped>
.meta {
  display: flex;
  align-content: center;
  align-items: flex-start;
  line-height: 1em;
  gap: 0.8em;
  .series {
    position: relative;
    top: -0.1em;
  }
  @media screen and (max-width: 500px) {
    gap: 0.4em;
  }
  .series img {
    display: inline-block;
    block-size: 1em;
    inline-size: 1em;
  }
  .pubtime {
    min-inline-size: 7em;
  }
}
</style>
