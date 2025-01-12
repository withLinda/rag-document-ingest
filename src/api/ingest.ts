import { api } from './config'
import type { IngestResponse, IngestStatus } from './types'

export async function ingestDocument(file: File, metadata: Record<string, string> = {}): Promise<IngestResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('namespaceId', api.namespaceId)

    const ingestConfig = {
      metadata: {
        ...metadata,
        fileType: file.type || 'application/octet-stream',
        fileName: file.name,
        uploadTimestamp: new Date().toISOString()
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
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData ? JSON.stringify(errorData) : response.statusText
      console.error('Ingest error details:', errorData)
      throw new Error(`Document Ingest failed: ${response.status} ${errorMessage}`)
    }

    const ingestResponse = await response.json()
    
    await waitForCompletion(
      ingestResponse.data.ingestJobRunId,
      (status) => console.log(`Processing status: ${status}`)
    )

    return ingestResponse
  } catch (error) {
    console.error('Document Ingest error:', error)
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

// Maintain backward compatibility
export const ingestPDF = ingestDocument
