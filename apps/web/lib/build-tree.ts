export type FileRecord = {
  path: string;
  summary?: string;
  url?: string;
};

export type TreeNode = {
  name: string;
  type: "file" | "folder";
  summary?: string;
  url?: string;
  children: Record<string, TreeNode>;
};

export function buildTree(files: FileRecord[]) {
  const root: TreeNode = {
    name: "root",
    type: "folder",
    children: {},
  };

  for (const file of files) {
    const parts = file.path.split("/");

    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: isLast ? "file" : "folder",
          children: {},
        };
      }

      current = current.children[part];

      if (isLast) {
        current.summary = file.summary;
        current.url = file.url;
      }
    }
  }

  return root.children;
}