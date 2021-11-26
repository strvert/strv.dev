<template>
  <section>
    <div class="basic-profiles">
      <div class="icon">
        <lazy-load-image
          class="icon-img"
          src="/images/logo/stonriver_1200.webp"
          alt="すとんりばーのアイコン"
        />
      </div>
      <div class="profile-infos">
        <object-table class="table" :data="basicProfileData" />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent, ref } from '#app';
import LazyLoadImage from '@/components/atoms/LazyLoadImage.vue';
import ObjectTable from '@/components/atoms/ObjectTable.vue';

import basicProfileData from '@/assets/json/profiles/basic.json';

export default defineNuxtComponent({
  name: 'basic-profile',
  components: { LazyLoadImage, ObjectTable },
  setup() {
    return { basicProfileData };
  },
});
</script>

<style lang="scss" scoped>
.basic-profiles {
  display: flex;
  align-items: center;
  gap: 1em;
  margin: 1em 0;
  .icon {
    flex: 1;

    .icon-img {
      block-size: 100%;
      inline-size: 100%;
    }

    @media screen and (max-width: 800px) {
      display: none;
    }
  }

  .profile-infos {
    flex: 3;

    .table {
      font-size: 1.24em;
      block-size: 98%;
      margin: auto;
      @media screen and (max-width: 800px) {
        font-size: 3.8vw;
      }
    }
  }
}
</style>
