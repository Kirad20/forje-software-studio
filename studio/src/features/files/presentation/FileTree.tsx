type FileEntry = { path: string; size: number };
type Folder = { name: string; path: string; folders: Map<string, Folder>; files: FileEntry[] };

function buildTree(files: FileEntry[]): Folder {
  const root: Folder = { name: "", path: "", folders: new Map(), files: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let folder = root;
    for (const name of parts.slice(0, -1)) {
      let child = folder.folders.get(name);
      if (!child) {
        child = { name, path: folder.path ? `${folder.path}/${name}` : name, folders: new Map(), files: [] };
        folder.folders.set(name, child);
      }
      folder = child;
    }
    folder.files.push(file);
  }
  return root;
}

function FolderContents({ folder, selectedPath, searching, onSelect }: {
  folder: Folder;
  selectedPath: string | null;
  searching: boolean;
  onSelect: (path: string) => void;
}) {
  const folders = [...folder.folders.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...folder.files].sort((a, b) => a.path.localeCompare(b.path));
  return (
    <ul className="tool-file-tree" role="list">
      {folders.map((child) => (
        <li key={child.path}>
          <details open={searching || Boolean(selectedPath?.startsWith(`${child.path}/`))}>
            <summary className="tool-folder" title={child.path}>{child.name}</summary>
            <FolderContents folder={child} selectedPath={selectedPath} searching={searching} onSelect={onSelect} />
          </details>
        </li>
      ))}
      {files.map((file) => {
        const name = file.path.split("/").pop() ?? file.path;
        const extension = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toUpperCase() : "FILE";
        return (
          <li key={file.path}>
            <button
              type="button"
              className={`tool-file-button${file.path === selectedPath ? " active" : ""}`}
              onClick={() => onSelect(file.path)}
              title={file.path}
              aria-label={file.path}
              aria-current={file.path === selectedPath ? "page" : undefined}
            >
              <span className="tool-file-extension" aria-hidden="true">{extension}</span>
              <span className="tool-file-label"><strong>{name}</strong></span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function FileTree({ files, selectedPath, searching, onSelect }: {
  files: FileEntry[];
  selectedPath: string | null;
  searching: boolean;
  onSelect: (path: string) => void;
}) {
  return <FolderContents key={String(searching)} folder={buildTree(files)} selectedPath={selectedPath} searching={searching} onSelect={onSelect} />;
}
