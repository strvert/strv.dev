<template>
  <div class="footer-wrapper">
    <footer class="footer-main">
      <contanct-profile class="contact" />
      <div class="infos">
        <p>
          <span class="copyright">© {{ copyright.year }} {{ copyright.rights }}.</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import ContanctProfile from '@/components/atoms/ContanctProfile.vue';

export default defineNuxtComponent({
  components: { ContanctProfile },
  setup() {
    const copyright = process.env.copyright;
    return { copyright };
  },
});
</script>

<style lang="scss" scoped>
.footer-wrapper {
  box-shadow: 0px 0px 3px 0px var(--strvdev-palette-3);
  margin-block-start: 5rem;
  padding-block-start: 1.5rem;
  .footer-main {
    position: relative;
    max-inline-size: 800px;
    margin: 0 auto;
    padding-block-end: 1rem;
    color: #000000bb;

    .infos {
      display: flex;
      justify-content: space-between;

      @mixin info-text {
        bottom: 1em;
        left: 0;
        font-size: 0.9rem;
        margin-block-start: 1em;
      }
      .copyright,
      .privacy {
        @include info-text;
      }
    }

    @media screen and (min-width: 800px) {
      .contact {
        position: relative;
        left: -1.2em;
        inline-size: 50%;
      }
    }

    @media screen and (max-width: 820px) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
}
</style>
