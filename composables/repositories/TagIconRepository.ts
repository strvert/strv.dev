import { TagIcon } from '@/composables/stores/TagIcon';

export interface TagIconRepositoryInterface {
  getIcon(tag: string): TagIcon | undefined;
  getDefaultIcon(): TagIcon;
}

import icons from '@/assets/json/icons.json';
export class StaticTagIconRepository implements TagIconRepositoryInterface {
  private findIcon(name: string): TagIcon | undefined {
    const icon = icons.find(elm => elm.name === name);
    return icon;
  }
  getIcon(name: string): TagIcon | undefined {
    return this.findIcon(name);
  }
  getDefaultIcon(): TagIcon {
    return icons.find(elm => elm.name === '__default')!;
  }
}
