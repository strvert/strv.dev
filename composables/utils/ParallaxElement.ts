import { ref, onMounted, onBeforeUnmount } from '#app';

export type ParallaxParameter = { selector: string; factor: number };

export const useParallaxElement = (targets: Array<ParallaxParameter>) => {
    onMounted(() => {
        document.addEventListener("mousemove", () => {

        });
    });
};
