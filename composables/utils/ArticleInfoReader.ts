import * as moment from 'moment-timezone';
import { IContentDocument } from '@nuxt/content/types/content';

export const readDateInfos = (content: IContentDocument, timezone: string = 'Asia/Tokyo') => {
  const createdAt = moment.tz(content.createdAt, timezone);
  const updatedAt = moment.tz(content.updatedAt, timezone);
  return { createdAt, updatedAt };
};
