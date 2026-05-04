export type FileRecord = {
  path: string;
  summary: string;
};

export type TreeNode = {
  __summary?: string;
  [key: string]: TreeNode | string | undefined;
};

export function buildTree(files: FileRecord[]) {
  const tree: TreeNode = {};

  for (const file of files) {
    const parts = file.path.split("/");

    let current: TreeNode = tree;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }

      current = current[part] as TreeNode;
    }

    current.__summary = file.summary;
  }

  return tree;
}