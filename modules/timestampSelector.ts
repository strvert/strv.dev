import { Module } from '#app';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

const TimestampSelectorModule: Module<Options> = function (moduleOptions: Options) {
  dayjs.locale('ja');
  this.nuxt.hook('content:file:beforeInsert', async (document, database) => {
    if (document.extension === '.md') {
      document.createdAt =
        document.enforceCreatedAt !== undefined
          ? dayjs(document.enforceCreatedAt).toDate()
          : document.gitCreatedAt;
      document.updatedAt =
        document.enforceUpdatedAt !== undefined
          ? dayjs(document.enforceUpdatedAt).toDate()
          : document.gitUpdatedAt;
    }
  });
};

export default TimestampSelectorModule;
