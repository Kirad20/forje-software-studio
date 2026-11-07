import type { ProjectRuntime } from "./ProjectSnapshot.js";
export type Visibility = "public" | "private";

export interface ProjectProps {
  id: string;
  ownerId: string;
  orgId: string | null;
  name: string;
  runtime?: ProjectRuntime;
  description: string;
  visibility?: Visibility;
  slug?: string | null;
  publishedVersionId?: string | null;
  files?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export class Project {
  readonly id: string;
  readonly ownerId: string;
  readonly orgId: string | null;
  name: string;
  readonly runtime: ProjectRuntime;
  description: string;
  visibility: Visibility;
  slug: string | null;
  publishedVersionId: string | null;
  files: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.orgId = props.orgId;
    this.name = props.name;
    this.runtime = props.runtime ?? "native";
    if (!["native", "repository"].includes(this.runtime)) throw new Error("Runtime no válido");
    this.description = props.description;
    this.visibility = props.visibility ?? (this.runtime === "repository" ? "private" : "public");
    this.slug = props.slug ?? null;
    this.publishedVersionId = props.publishedVersionId ?? null;
    this.files = props.files ? { ...props.files } : {};
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPrivate(): boolean {
    return this.visibility === "private";
  }

  isPublished(): boolean {
    return !!this.publishedVersionId;
  }

  publish(slug: string, versionId: string): void {
    this.slug = slug;
    this.publishedVersionId = versionId;
  }

  unpublish(): void {
    this.slug = null;
    this.publishedVersionId = null;
  }
}
