import { api } from './config'
import type { SearchRequest, SearchResponse } from './types'

export async function searchDocuments(params: SearchRequest): Promise<SearchResponse> {
  try {
    // Enhanced request body with corrected parameter names
    const requestBody = {
      query: params.query,
      namespaceId: params.namespaceId,
      topK: 15,                    // Increased from 10 for better coverage
      scoreThreshold: 0.3,         // Corrected from minScore to scoreThreshold
      searchType: "HYBRID",        // Explicitly set hybrid search
      hybridConfig: {              // Added hybrid search configuration
        semanticWeight: 0.65,      // Slightly reduced from default for better balance
        keywordWeight: 0.35        // Slightly increased for better keyword matching
      }
    }

    console.log('Search Request:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${api.baseUrl}/search/hybrid`, {
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
