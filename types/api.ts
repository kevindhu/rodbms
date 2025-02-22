export interface DatastoreEntry {
  key: string;
}

export interface DatastoreVersion {
  version: string;
  deleted: boolean;
  contentLength: number;
  createdTime: string;
}

interface DatastoreInfo {
  name: string;
  createdTime: string;
}

export interface DatastoreResponse {
  datastores?: DatastoreInfo[];
  keys?: string[];
  entries?: DatastoreEntry[];
  versions?: DatastoreVersion[];
  nextPageCursor?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  status?: number;
}

export interface DatastoreListProps {
  datastores: string[];
  onSelect: (name: string) => void;
  selected?: string;
}

export interface EntryListProps {
  entries: DatastoreEntry[];
  onSelect: (key: string) => void;
  selected?: string;
}

export interface DatastoreParams {
  universeId: string;
  apiToken: string;
  datastoreName: string;
  entryKey?: string;
  scope?: string;
  prefix?: string;
  cursor?: string;
  limit?: number;
}

export type ApiResponse<T> = T | ErrorResponse; 