import { IContent } from '@/composables/stores/Article';

export interface ISeries {
  name: string;
  icon: string;
  contents: Array<IContent>;
}
