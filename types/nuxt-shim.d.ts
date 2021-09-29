import '@nuxt/types';
import { Repositories } from '@/plugins/RepositoryFactory';

declare module '@nuxt/types' {
    interface Context {
        $repositories: Repositories;
    }
}
