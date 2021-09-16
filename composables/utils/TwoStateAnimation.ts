import { ref, Ref } from '@nuxtjs/composition-api';

export const useTwoStateAnimation = (anim: Ref<Animation | undefined>, initState = false) => {
  const state = ref(initState);
  const setState = (value: boolean) => {
    if (value) {
      anim.value!.playbackRate = 1;
    } else {
      anim.value!.playbackRate = -1;
    }
    anim.value!.play();
    state.value = value;
  };
  const toggle = () => {
    setState(!state.value);
  };
  return { state, toggle, setState };
};
