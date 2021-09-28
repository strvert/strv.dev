import { ref, Ref } from '@nuxtjs/composition-api';

export const useResizeEvent = () => {
  const width = ref<number>();
  const height = ref<number>();

  const eventHandler = () => {
    height.value = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    width.value = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  const addEvent = () => {
    eventHandler();
    window.addEventListener('resize', eventHandler);
  };

  const removeEvent = () => {
    window.removeEventListener('resize', eventHandler);
  };
  return { width, height, addEvent, removeEvent };
};
