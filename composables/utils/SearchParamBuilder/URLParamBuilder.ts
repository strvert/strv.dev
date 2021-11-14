import { SearchParam } from '@/composables/utils/SearchParam';
import { useRoute } from '#app';

export class URLParamBuilder {
  route = useRoute();
  update = (): SearchParam => {
    return {
      tags: [this.route.query.t],
    };
  };
}
