export interface ProjectInviteProps {
  projectId: string;
  email: string;
  invitedBy: string;
  createdAt?: string;
}

export class ProjectInvite {
  readonly projectId: string;
  readonly email: string;
  readonly invitedBy: string;
  readonly createdAt?: string;

  constructor(props: ProjectInviteProps) {
    const trimmedEmail = props.email.trim().toLowerCase();
    const inviter = props.invitedBy.trim().toLowerCase();

    ProjectInvite.assertEmail(trimmedEmail);

    if (trimmedEmail === inviter) {
      throw new Error("Ya tienes acceso a este proyecto");
    }

    this.projectId = props.projectId;
    this.email = trimmedEmail;
    this.invitedBy = inviter;
    this.createdAt = props.createdAt;
  }

  static assertEmail(email: string): void {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Correo no válido");
    }
  }
}
