import { api } from './config'
import type { IngestResponse, IngestStatus } from './types'

// Main ingestion function
export async function ingestDocument(text: string): Promise<IngestResponse> {
  try {
    // Enhanced request body with chunk configuration
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
              source: 'pricing-docs',
              category: 'enterprise',
              last_updated: '2024-01',
            },
            // Added chunk configuration
            chunkConfig: {
              chunkSize: 500,    // Process text in 500-token chunks
              chunkOverlap: 50   // 50-token overlap between chunks
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
    
    // After getting initial response, wait for processing completion
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
  onStatusUpdate?: (status: string) => void
): Promise<void> {
  let attempts = 0
  const maxAttempts = 30  // 30 attempts with 1-second delay = 30 seconds max
  const delayMs = 1000    // 1 second delay between checks

  while (attempts < maxAttempts) {
    const status = await checkIngestStatus(jobId)
    onStatusUpdate?.(status.data.status)

    switch (status.data.status) {
      case 'COMPLETED':
        console.log('Document processing completed successfully')
        // Add additional delay after completion for indexing
        await new Promise(resolve => setTimeout(resolve, 5000))
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
  }

  throw new Error('Operation timed out: Document processing took too long')
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
