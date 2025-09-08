// Client-only helpers for drag-and-drop traversal of directories/files

export interface DroppedEntry {
  file: File;
  relativePath: string; // path relative to the dropped root
}

export interface TraverseResult {
  files: DroppedEntry[];
  dirs: string[]; // relative directory paths, trailing '/'
}

export async function traverseDataTransferItems(items: DataTransferItemList): Promise<TraverseResult> {
  const files: DroppedEntry[] = [];
  const dirs = new Set<string>();

  const pushDir = (rel: string) => {
    const norm = normalizeRelDir(rel);
    if (norm) dirs.add(norm);
  };

  const walkEntry = async (entry: any, base: string) => {
    if (entry.isFile) {
      await new Promise<void>((resolve, reject) => {
        entry.file((file: File) => {
          files.push({ file, relativePath: base });
          resolve();
        }, reject);
      });
    } else if (entry.isDirectory) {
      pushDir(base);
      const reader = entry.createReader();
      await new Promise<void>((resolve, reject) => {
        const read = () => {
          reader.readEntries(async (entries: any[]) => {
            if (!entries.length) return resolve();
            for (const child of entries) {
              const childPath = base ? `${base}${child.name}` : child.name;
              await walkEntry(child, childPath + (child.isDirectory ? '/' : ''));
            }
            // Keep reading until empty per spec
            read();
          }, reject);
        };
        read();
      });
    }
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = (item as any).webkitGetAsEntry?.();
    if (!entry) {
      const f = item.getAsFile?.();
      if (f) files.push({ file: f, relativePath: f.name });
      continue;
    }
    await walkEntry(entry, entry.isDirectory ? `${entry.name}/` : entry.name);
  }

  return { files, dirs: Array.from(dirs) };
}

export function filesFromDirectoryInput(fileList: FileList): DroppedEntry[] {
  const res: DroppedEntry[] = [];
  for (let i = 0; i < fileList.length; i++) {
    const f = fileList[i];
    const rel = (f as any).webkitRelativePath || f.name;
    res.push({ file: f, relativePath: rel });
  }
  return res;
}

function normalizeRelDir(p: string): string {
  const s = (p || '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (!s) return '';
  return s + '/';
}

