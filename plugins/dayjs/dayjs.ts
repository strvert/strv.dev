import { Inject, NuxtApp } from '@nuxt/types/app';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

export default ({}: { app: NuxtApp }, inject: Inject) => {
  dayjs.locale('ja');
  dayjs.extend(LocalizedFormat);
  inject('dayjs', dayjs);
};
