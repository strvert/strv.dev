<template>
  <section>
    <h2>コンタクト</h2>
    <address>
      <p v-for="info in ContactInfos" :key="info.servcieName">
        <span class="im icon" v-html="info.iconmonstr"></span>
        <span v-if="info.type === 'link'">
          <a class="display" :href="info.link">{{ info.display }}</a>
        </span>
        <span class="display" v-else-if="info.type === 'email'">
          <display-email :mail="info.display"
        /></span>
      </p>
    </address>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import ContactInfos from '@/assets/json/profiles/contacts.json';
import DisplayEmail from '@/components/atoms/DisplayEmail.vue';

export default defineNuxtComponent({
  name: 'contact-profile',
  components: { DisplayEmail },
  setup() {
    return { ContactInfos };
  },
});
</script>

<style lang="scss" scoped>
h2 {
  display: none;
}

address {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  margin: 0 1em;
  gap: 1em;

  p {
    display: flex;
    align-items: center;
    margin: 0;
    gap: 0.2em;
    .icon {
      position: relative;
      top: 0.095em;
      font-size: inherit;
    }
    .display {
      font-size: 1em;
      font-style: normal;
    }
  }
}
</style>
