export interface FileMetadata {
  id: string;
  path: string;
  name: string;
  ext: string;
  imports: string[];
  exports: string[];
  summary: string | null;
  updatedAt: Date;
}

export interface ContextBlock {
  fileName: string;
  code: string;
  summary: string;
  imports: string[];
  impactedBy: string[];
}

export interface SearchResult {
  file: FileMetadata;
  score: number;
}
