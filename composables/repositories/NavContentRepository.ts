import { NavContent } from '@/composables/stores/NavContent';

export interface NavContentRepositroyInterface {
    get(): Array<NavContent>;
}
