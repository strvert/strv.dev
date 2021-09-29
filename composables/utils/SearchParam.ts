export interface SearchParam {
  tags?: Array<string>;
  keywords?: Array<string>;
}

export const makeSearchParameter = (obj: SearchParam) => {
  const param = new URLSearchParams();
  if (obj.tags !== undefined) {
    for (const tag of obj.tags) {
      param.append('t', tag);
    }
  }
  if (obj.keywords !== undefined) {
    for (const keyword of obj.keywords) {
      param.append('kw', keyword);
    }
  }
  return param;
};
