export const api = {
    key: import.meta.env.VITE_RAGAAS_API_KEY,
    // Remove the full URL and just use the path
    baseUrl: '/v1', // Changed from 'https://api.ragaas.dev/v1'
    namespaceId: import.meta.env.VITE_NAMESPACE_ID,
  } as const
  