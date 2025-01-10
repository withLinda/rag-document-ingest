// First, let's define our processing status type
export type ProcessingStatusType = 'QUEUED' | 'PRE_PROCESSING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING';

// Let's create a common type for status data
interface ProcessingStatusData {
  status: ProcessingStatusType;
  error?: string;
}

// Ingest Types
export interface IngestConfig {
  source: 'TEXT' | 'PDF';
  config: {
    text?: string;
    file?: File;
    metadata?: Record<string, string>;
    chunkConfig?: {
      chunkSize: number;
      chunkOverlap: number;
    };
  };
}

export interface PDFIngestConfig {
  file: File;
  metadata?: Record<string, string>;
  namespaceId: string;
}

export interface IngestResponse {
  success: boolean;
  data: {
    ingestJobRunId: string;
  };
}

export interface IngestStatus {
  success: boolean;
  data: ProcessingStatusData; // Using the common type
}

// Search Types
export interface SearchFilter {
  metadata?: Record<string, string>;
}

export interface SearchRequest {
  query: string;
  namespaceId: string;
  topK?: number;
  scoreThreshold?: number;
  filter?: SearchFilter;
}

export interface SearchResult {
  content: string;
  score: number;
  metadata?: Record<string, string>;
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
  };
  error?: {
    message: string;
    code: string;
  };
}

// src/api/types.ts

export type SearchType = 'SEMANTIC' | 'HYBRID';

export interface HybridConfig {
  semanticWeight: number;
  keywordWeight: number;
}

export interface SearchRequest {
  query: string;
  namespaceId: string;
  topK?: number;
  scoreThreshold?: number;
  searchType?: SearchType;
  hybridConfig?: HybridConfig;
  filter?: {
    metadata?: Record<string, string>;
  };
}
