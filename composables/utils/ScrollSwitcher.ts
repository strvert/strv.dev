import { ref } from '#app';
export const useScrollSwitcher = () => {
  function notscroll(e: any) {
    e.preventDefault();
  }

  const disabled = ref(false);
  const disable = () => {
    document.addEventListener('wheel', notscroll, { passive: false });
    document.addEventListener('touchmove', notscroll, { passive: false });
    disabled.value = true;
  };
  const enable = () => {
    document.removeEventListener('wheel', notscroll);
    document.removeEventListener('touchmove', notscroll);
    disabled.value = false;
  };
  const toggle = () => {
    if (disabled.value) {
      enable();
    } else {
      disable();
    }
  };
  return { disable, enable, toggle, disabled };
};
