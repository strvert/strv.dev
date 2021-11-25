import { IContentDocument } from '@nuxt/content/types/content';
import { useNuxtApp } from '#app';

export const readDateInfos = (content: IContentDocument) => {
  const { $dayjs } = useNuxtApp();
  const createdAt = $dayjs(content.createdAt);
  const updatedAt = $dayjs(content.updatedAt);
  return { createdAt, updatedAt };
};
