// src/api/types.ts

// Ingest Types
export interface IngestConfig {
    source: 'TEXT'
    config: {
      text: string
      metadata: {
        source: string
        category: string
        last_updated: string
        [key: string]: string  // Allow additional metadata fields
      }
    }
  }
  
  export interface IngestResponse {
    success: boolean
    data: {
      ingestJobRunId: string
    }
  }
  
  export interface IngestStatus {
    success: boolean
    data: {
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
      error?: string
    }
  }
  
  // Search Types
  export interface SearchFilter {
    metadata?: Record<string, string>
  }
  
  export interface SearchRequest {
    query: string
    namespaceId: string
    topK?: number
    minScore?: number
    filter?: SearchFilter
  }
  
  export interface SearchResult {
    content: string
    score: number
    metadata?: Record<string, string>
  }
  
  export interface SearchResponse {
    success: boolean
    data: {
      results: SearchResult[]
    }
    error?: {
      message: string
      code: string
    }
  }
  