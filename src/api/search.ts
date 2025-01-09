import { api } from './config'
import type { SearchRequest, SearchResponse } from './types'

export async function searchDocuments(params: SearchRequest): Promise<SearchResponse> {
  try {
    // Simplified request body with exact parameter names
    const requestBody = {
      query: params.query,          // Changed from 'query' to 'text'
      namespaceId: params.namespaceId,
      topK: 10,
      minScore: 0.0,              // Changed from scoreThreshold to minScore and lowered to 0
      // Removed all filters for testing
    }

    console.log('Search Request:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${api.baseUrl}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Response status:', response.status, response.statusText)
    const responseData = await response.json()
    console.log('Search Response:', JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${JSON.stringify(responseData)}`)
    }

    return responseData
  } catch (error) {
    console.error('Search error details:', error)
    throw error
  }
}
