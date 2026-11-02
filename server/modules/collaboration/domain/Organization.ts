import { OrgPolicy, type OrgRole } from "./OrgPolicy.js";

export interface OrganizationProps {
  id: string;
  name: string;
  slug: string | null;
  personal: boolean;
}

export class Organization {
  readonly id: string;
  name: string;
  slug: string | null;
  readonly personal: boolean;

  constructor(props: OrganizationProps) {
    this.id = props.id;
    this.name = props.personal ? props.name : OrgPolicy.validateName(props.name);
    this.slug = props.slug;
    this.personal = props.personal;
  }

  static personalId(accountId: string): string {
    return `personal_${accountId}`;
  }

  isPersonal(): boolean {
    return this.personal;
  }
}
