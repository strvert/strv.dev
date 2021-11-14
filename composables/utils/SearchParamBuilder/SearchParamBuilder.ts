import { SearchParam } from '@/composables/utils/SearchParam';
export interface ParamBuilder {
  update: () => SearchParam;
}
