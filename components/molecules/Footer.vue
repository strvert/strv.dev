<template>
  <div class="footer-wrapper">
    <footer class="footer-main">
      <div class="links">
        <address>
          <p>
            <i class="im im-github"></i>
            <a :href="`https://github.com/${authorInfo.github}`">{{ authorInfo.github }}</a>
          </p>
          <p>
            <i class="im im-twitter"></i>
            <a :href="`https://twitter.com/${authorInfo.twitter}`">@{{ authorInfo.twitter }}</a>
          </p>
          <p>
            <i class="im im-book"></i>
            <a href="https://github.com/strvert/strv.dev">strvert/strv.dev</a>
          </p>
        </address>
      </div>
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

export default defineNuxtComponent({
  components: {},
  setup() {
    const copyright = process.env.copyright;
    const authorInfo = process.env.authorInfo;
    return { copyright, authorInfo };
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

    .im {
      font-size: 1.5rem;
    }

    address {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.8rem;
      font-style: normal;
      p {
        display: flex;
        gap: 0.6rem;
        align-content: center;
        align-items: center;
        margin: 0;
        font-size: 0.9rem;
      }
    }
    .repository {
      margin-block-start: 0.5rem;
      p {
        display: flex;
        gap: 0.6rem;
        align-content: center;
        align-items: center;
        margin: 0;
      }
    }

    @media screen and (max-width: 820px) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
}
</style>
