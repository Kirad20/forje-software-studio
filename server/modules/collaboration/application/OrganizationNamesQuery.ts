import type { IOrganizationNameDirectory } from "../ports/queries.js";

export class OrganizationNamesQuery {
  constructor(private readonly directory: IOrganizationNameDirectory) {}

  async execute(ids: string[]): Promise<Record<string, string>> {
    if (ids.length === 0) return {};
    return this.directory.organizationNames(ids);
  }
}
