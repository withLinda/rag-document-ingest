import { api } from './config'
import type { IngestResponse, IngestStatus } from './types'

// Main text ingestion function
export async function ingestDocument(text: string): Promise<IngestResponse> {
  try {
    const response = await fetch(`${api.baseUrl}/ingest/text`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespaceId: api.namespaceId,
        ingestConfig: {
          source: 'TEXT',
          config: {
            text,
            metadata: {
              source: 'text-upload',
              timestamp: new Date().toISOString()
            },
            chunkConfig: {
              chunkSize: 500,
              chunkOverlap: 50
            }
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Ingest failed: ${response.status} ${
          errorData ? JSON.stringify(errorData) : response.statusText
        }`
      )
    }

    const ingestResponse = await response.json()
    
    await waitForCompletion(
      ingestResponse.data.ingestJobRunId,
      (status) => console.log(`Processing status: ${status}`)
    )

    return ingestResponse
  } catch (error) {
    console.error('Ingest error details:', error)
    throw error
  }
}

// Check the status of an ingestion job
export async function checkIngestStatus(jobId: string): Promise<IngestStatus> {
  try {
    const response = await fetch(
      `${api.baseUrl}/ingest-job-runs/${jobId}?namespaceId=${api.namespaceId}`,
      {
        headers: {
          Authorization: `Bearer ${api.key}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Status check failed: ${response.status} ${
          errorData ? JSON.stringify(errorData) : response.statusText
        }`
      )
    }

    return response.json()
  } catch (error) {
    console.error('Status check error details:', error)
    throw error
  }
}

// Enhanced waitForCompletion with better status handling and timeouts
export async function waitForCompletion(
  jobId: string,
  onStatusUpdate?: (status: string) => void,
  maxAttempts = 30
): Promise<void> {
  let attempts = 0
  const delayMs = 2000    // 2 second delay between checks

  while (attempts < maxAttempts) {
    try {
      const status = await checkIngestStatus(jobId)
      onStatusUpdate?.(status.data.status)

      switch (status.data.status) {
        case 'COMPLETED':
          console.log('Document processing completed successfully')
          return
        case 'FAILED':
          throw new Error(`Ingestion failed: ${status.data.error || 'Unknown error'}`)
        case 'PROCESSING':
        case 'PENDING':
          // Continue waiting
          break
        default:
          console.warn(`Unknown status received: ${status.data.status}`)
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, delayMs))
    } catch (error) {
      console.error('Status check error:', error)
      throw error
    }
  }

  throw new Error('Operation timed out: Document processing took too long')
}

// PDF ingestion function
export async function ingestPDF(file: File, metadata: Record<string, string> = {}): Promise<IngestResponse> {
  try {
    const formData = new FormData()
    
    // Basic configuration
    formData.append('file', file)
    formData.append('namespaceId', api.namespaceId)

    // Enhanced configuration with embedding model details
    const ingestConfig = {
      metadata: {
        ...metadata,
        source: 'pdf-upload',
        timestamp: new Date().toISOString()
      },
      chunkConfig: {
        chunkSize: 500,
        chunkOverlap: 50
      },
      embeddingConfig: {
        model: 'jina-embeddings-v3',
        dimensions: 1024,
        maxTokens: 8192
      }
    }

    formData.append('config', JSON.stringify(ingestConfig))

    const response = await fetch(`${api.baseUrl}/ingest/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api.key}`
        // Don't set Content-Type with FormData
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData ? JSON.stringify(errorData) : response.statusText
      console.error('Ingest error details:', errorData)
      throw new Error(`PDF Ingest failed: ${response.status} ${errorMessage}`)
    }

    const ingestResponse = await response.json()
    
    await waitForCompletion(
      ingestResponse.data.ingestJobRunId,
      (status) => console.log(`Processing status: ${status}`)
    )

    return ingestResponse
  } catch (error) {
    console.error('PDF Ingest error:', error)
    throw error
  }
}

// Utility function to verify complete ingestion status
export async function verifyIngestion(jobId: string): Promise<boolean> {
  try {
    const status = await checkIngestStatus(jobId)
    return status.data.status === 'COMPLETED'
  } catch (error) {
    console.error('Verification failed:', error)
    return false
  }
}
