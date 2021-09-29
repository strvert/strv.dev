import { Inject, NuxtApp } from '@nuxt/types/app';
import { NavContentRepositroyInterface } from '@/composables/repositories/NavContentRepository';

import { NavContentRepositroy } from '@/composables/repositories/NavContentRepository';

export interface Repositories {
  navContent: NavContentRepositroyInterface;
}

export default ({}: { app: NuxtApp }, inject: Inject) => {
  const repositories: Repositories = {
    navContent: new NavContentRepositroy()
  };
  inject('repositories', repositories);
};
