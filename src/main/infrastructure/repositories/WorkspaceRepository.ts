import fs from "fs/promises";
import path from "path";
import type { Workspace } from "../../../shared/entities";

export interface IWorkspaceRepository {
  load(): Promise<Workspace>;
  save(workspace: Workspace): Promise<void>;
}

const DEFAULT: Workspace = {
  id: "default",
  name: "My Workspace",
  profiles: [
    {
      id: "profile-1",
      name: "Default Profile",
      defaultPageId: "page-1",
      pages: [
        {
          id: "page-1",
          name: "Main",
          columns: 3,
          rows: 2,
          buttons: [
            {
              id: "btn-1",
              label: "Button 1",
              style: { backgroundColor: "#7c3aed", textColor: "#fff", borderRadius: 8, fontSize: 14 },
              actions: [],
            },
            {
              id: "btn-2",
              label: "Button 2",
              style: { backgroundColor: "#2563eb", textColor: "#fff", borderRadius: 8, fontSize: 14 },
              actions: [],
            },
            {
              id: "btn-3",
              label: "Button 3",
              style: { backgroundColor: "#059669", textColor: "#fff", borderRadius: 8, fontSize: 14 },
              actions: [],
            },
          ],
        },
      ],
    },
  ],
  activeProfileId: "profile-1",
};

export class JsonWorkspaceRepository implements IWorkspaceRepository {
  private readonly filePath: string;

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "workspace.json");
  }

  async load(): Promise<Workspace> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as Workspace;
    } catch {
      return DEFAULT;
    }
  }

  async save(workspace: Workspace): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(workspace, null, 2), "utf-8");
  }
}
