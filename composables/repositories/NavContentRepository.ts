import { NavContent } from '@/composables/stores/NavContent';

export interface NavContentRepositroyInterface {
  get(): Array<NavContent>;
}

export class NavContentRepositroy implements NavContentRepositroyInterface {
  get(): Array<NavContent> {
    return new Array<NavContent>(
      { URI: '/', displayName: 'HOME' },
      { URI: '/blog', displayName: 'BLOG' },
      { URI: '/about', displayName: 'ABOUT' }
    );
  }
}
