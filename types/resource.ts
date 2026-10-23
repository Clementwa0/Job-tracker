import type { ResourceStatus, ResourceType, StoredFile } from "@/lib/resources/constants";
import type { PaginatedMeta } from "@/types/admin";

export type { ResourceStatus, ResourceType, StoredFile };

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Total resources assigned (admin lists) or published ones (public filters). */
  resourceCount: number;
}

/** Card-level data - no body content. Safe for public lists. */
export interface ResourceListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ResourceType;
  tags: string[];
  featured: boolean;
  coverImageUrl: string | null;
  hasAttachment: boolean;
  hasExternalUrl: boolean;
  category: { id: string; name: string; slug: string } | null;
  publishedAt: string | null;
}

export interface RecommendedResource extends ResourceListItem {
  /** Why this was suggested, e.g. "You have an upcoming interview". */
  reason: string;
}

/** Row in the admin resources table. */
export interface AdminResourceListItem {
  id: string;
  title: string;
  slug: string;
  type: ResourceType;
  status: ResourceStatus;
  featured: boolean;
  views: number;
  category: { id: string; name: string } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Everything the admin form edits. */
export interface AdminResource extends AdminResourceListItem {
  description: string;
  categoryId: string;
  content: string;
  coverImage: StoredFile | null;
  attachment: StoredFile | null;
  externalUrl: string | null;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

/** Full public view of a published resource. */
export interface PublicResource extends ResourceListItem {
  /** Sanitized HTML. */
  content: string;
  attachment: Pick<StoredFile, "url" | "originalFilename" | "size" | "fileType"> | null;
  externalUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  views: number;
  readingMinutes: number;
  updatedAt: string;
}

export interface AdminResourceSummary {
  total: number;
  published: number;
  draft: number;
}

export interface ResourceListResponse<S = undefined> {
  data: ResourceListItem[];
  meta: PaginatedMeta;
  summary?: S;
}
