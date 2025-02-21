export interface DatastoreEntry {
  key: string;
  value?: unknown;
}

export interface DatastoreResponse {
  datastores?: string[];
  keys?: string[];
  nextPageCursor?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
}

export type ApiResponse<T> = T | ErrorResponse; 