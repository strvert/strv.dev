import { NavContent } from '@/composables/stores/NavContent';

export interface NavContentRepositroyInterface {
  get(): Array<NavContent>;
}

import navcontent from '@/assets/json/navcontent.json';
export class StaticNavContentRepositroy implements NavContentRepositroyInterface {
  get(): Array<NavContent> {
    return navcontent;
  }
}
