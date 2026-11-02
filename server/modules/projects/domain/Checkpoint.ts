import type { Author } from "../ports/repositories.js";

export interface CheckpointProps {
  id?: number;
  projectId: string;
  label: string;
  author: Author;
  actor?: string | null;
  description?: string | null;
  createdAt?: string;
}

export class Checkpoint {
  readonly id?: number;
  readonly projectId: string;
  readonly label: string;
  readonly author: Author;
  readonly actor: string | null;
  readonly description: string | null;
  readonly createdAt?: string;

  constructor(props: CheckpointProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.label = (props.label ?? "").slice(0, 120);
    this.author = props.author;
    this.actor = props.actor ?? null;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt;
  }
}
