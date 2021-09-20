import { ref, Ref } from '@nuxtjs/composition-api';

export const useScrollAmountEvent = (amount: number) => {
  const state = ref(false);

  const eventHandler = () => {
    if (window.scrollY >= amount) {
      state.value = true;
    } else {
      state.value = false;
    }
  };

  const addEvent = () => {
    eventHandler();
    window.addEventListener('scroll', eventHandler);
  };

  const removeEvent = () => {
    window.removeEventListener('scroll', eventHandler);
  };

  return { state, addEvent, removeEvent };
};

export const useScrollDirectionEvent = () => {
  const state = ref(false);
  let scrollPos = 0;

  const eventHandler = () => {
      if (window.scrollY >= scrollPos) {
        state.value = true;
      } else {
        state.value = false;
      }
      scrollPos = window.scrollY;
  };

  const addEvent = () => {
    eventHandler();
    window.addEventListener('scroll', eventHandler);
  };

  const removeEvent = () => {
    window.removeEventListener('scroll', eventHandler);
  };

  return { state, addEvent, removeEvent };
};
