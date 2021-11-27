import { ref, onMounted, onBeforeUnmount } from '#app';

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

  onMounted(() => {
    addEvent();
  });

  onBeforeUnmount(() => {
    removeEvent();
  });

  return { width, height, addEvent, removeEvent };
};
