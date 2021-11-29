<template>
  <section>
    <div class="basic-profiles">
      <header class="icon">
        <lazy-load-image
          class="icon-img"
          src="/images/logo/stonriver_640.webp"
          alt="すとんりばーのアイコン"
        />
      </header>
      <div class="profile-infos">
        <object-table class="table" :data="basicProfileData" />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
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
  justify-content: center;

  gap: 1em;
  @media screen and (max-width: 800px) {
    flex-direction: column;
  }

  .icon {
    flex: 1;
    .icon-img {
      display: block;
      margin: 0 auto;
      inline-size: 100%;
      @media screen and (max-width: 800px) {
        inline-size: 40%;
      }
    }
  }

  .profile-infos {
    flex: 3;

    .table {
      block-size: 98%;
      margin: auto;
    }
  }
}
</style>
