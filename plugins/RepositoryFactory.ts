import { Inject, NuxtApp } from '@nuxt/types/app';

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
  tagIcon: TagIconRepositoryInterface;
}

export default ({}: { app: NuxtApp }, inject: Inject) => {
  const repositories: Repositories = {
    navContent: new StaticNavContentRepositroy(),
    tagIcon: new StaticTagIconRepository()
  };
  inject('repositories', repositories);
};
