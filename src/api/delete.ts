import { api } from './config'
import type { DeleteResponse, DeleteFilterConfig } from './types'

export async function deleteDocuments(metadata: Record<string, string>): Promise<DeleteResponse> {
  try {
    // Create a filter config that includes both metadata and required empty arrays
    const filterConfig: DeleteFilterConfig = {
      documentIds: [], // Required empty array
      documentExternalIds: [], // Required empty array
      documentTypes: [], // Required empty array
      metadata // Include the metadata filter
    };

    const response = await fetch(`${api.baseUrl}/documents`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${api.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespaceId: api.namespaceId,
        filterConfig
      }),
    });

    const responseData: DeleteResponse = await response.json();

    if (!response.ok) {
      console.error('Delete API Error:', responseData);
      throw new Error(
        responseData.error?.message || 
        `Delete failed: ${response.status} ${JSON.stringify(responseData)}`
      );
    }

    return responseData;
  } catch (error) {
    console.error('Delete error details:', error);
    throw error;
  }
}

// Utility function to create filter config
export function createDeleteFilterConfig(
  metadata: Record<string, string>,
  options: Partial<Omit<DeleteFilterConfig, 'metadata'>> = {}
): DeleteFilterConfig {
  return {
    documentIds: options.documentIds || [],
    documentExternalIds: options.documentExternalIds || [],
    documentTypes: options.documentTypes || [],
    metadata
  };
}
