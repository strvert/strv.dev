import { SearchParam } from '@/composables/utils/SearchParam';
export class StaticParamBuilder {
  private param;
  constructor(param: SearchParam) {
    this.param = param;
  }
  update(): SearchParam {
    return this.param;
  }
}
