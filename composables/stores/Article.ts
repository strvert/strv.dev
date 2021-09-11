import { IContentDocument } from "@nuxt/content/types/content";

type ForeignArticleProvider = "qiita" | "hatena";

export interface IForeignArticleMetadata {
  url: string;
  provider: ForeignArticleProvider;
}

export interface TOCEntry {
  id: string;
  depth: number;
  text: string;
}

export interface IContent extends IContentDocument {
  title: string;
  description: string;
  toc?: TOCEntry[];
}

export interface IArticle extends IContent {
  tags?: string[];
  foreignArticleMeta?: IForeignArticleMetadata;
  customThumbnail?: string;
}
