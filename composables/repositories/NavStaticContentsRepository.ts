import { NavContent } from '@/composables/stores/NavContent';
import { NavContentRepositroyInterface } from '@/composables/repositories/NavContentRepository';

export class NavContentRepositroy implements NavContentRepositroyInterface {
  get(): Array<NavContent> {
    return new Array<NavContent>(
      { URI: '/', DisplayName: 'TOP' },
      { URI: '/blog', DisplayName: 'BLOG' },
      { URI: '/about', DisplayName: 'ABOUT' }
    );
  }
}
