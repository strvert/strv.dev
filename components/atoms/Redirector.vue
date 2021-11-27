<template>
  <div>
    <header class="redirect-message">
      <div class="wrapper">
        <h1>
          <slot name="message" :remaining="remaining" />
        </h1>
        <p class="message">
          <slot name="submessage" :redirect="redirect" :remaining="remaining" />
        </p>
      </div>
    </header>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  useNuxt2Meta,
  useRouter,
  onMounted,
  onBeforeUnmount,
} from '#app';
import { ControllableTimer } from '@/composables/utils/Timers';

export default defineComponent({
  props: {
    redirect: {
      type: Boolean,
      default: true,
    },
    to: {
      type: String,
      required: true,
    },
    wait: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const remaining = ref<number>(Math.ceil(props.wait / 1000));
    const router = useRouter();
    const timer = reactive<ControllableTimer>(
      new ControllableTimer(() => {
        if (props.redirect) {
          router.push(props.to);
        }
      }, props.wait)
    );
    onMounted(() => {
      timer.start();
      useNuxt2Meta({ titleTemplate: '', title: 'strv.dev' });

      timer.register(() => {
        remaining.value = Math.ceil(timer.remainingTime() / 1000);
      }, 100);
    });

    onBeforeUnmount(() => {
      timer.unregister();
    });

    return { remaining };
  },
});
</script>

<style lang="scss" scoped>
span {
  display: inline-block;
}
.redirect-message {
  text-align: center;
  inline-size: 100%;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);

  .wrapper {
    inline-size: 90%;
    block-size: 100%;
    margin: 0 auto;
  }

  h1 {
    font-size: 5rem;
    margin-block-end: 1rem;
    line-height: 6rem;

    @media screen and (max-width: 700px) {
      font-size: 4.9rem;
    }
  }

  .message {
    font-size: 1.4rem;

    @media screen and (max-width: 700px) {
      font-size: 1.1rem;
    }
  }
}
</style>
