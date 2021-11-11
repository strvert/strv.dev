import { Inject, NuxtApp } from '@nuxt/types/app';
import { Plugin } from '@nuxt/types';

import {
  NavContentRepositroyInterface,
  StaticNavContentRepositroy
} from '@/composables/repositories/NavContentRepository';
import {
  TagIconRepositoryInterface,
  StaticTagIconRepository
} from '@/composables/repositories/TagIconRepository';

export interface Repositories {
  navContent: NavContentRepositroyInterface;
  icons: TagIconRepositoryInterface;
}

export default <Plugin> ({}: { app: NuxtApp }, inject: Inject) => {
  const repositories: Repositories = {
    navContent: new StaticNavContentRepositroy(),
    icons: new StaticTagIconRepository()
  };
  inject('repositories', repositories);
};
