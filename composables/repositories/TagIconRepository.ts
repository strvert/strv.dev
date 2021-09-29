import { TagIcon } from '@/composables/stores/TagIcon';

export interface TagIconRepositoryInterface {
  getIcon(tag: string): TagIcon | undefined;
  getDefaultIcon(): TagIcon;
}

import tagicon from '@/assets/json/tagicon.json';
export class StaticTagIconRepository implements TagIconRepositoryInterface {
  private findIcon(tag: string): TagIcon | undefined {
    const icon = tagicon.find(elm => elm.tag === tag);
    return icon;
  }
  getIcon(tag: string): TagIcon | undefined {
    return this.findIcon(tag);
  }
  getDefaultIcon(): TagIcon {
    return tagicon.find(elm => elm.tag === '__default')!;
  }
}
