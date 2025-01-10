import { useState, useCallback } from 'react'
import { searchDocuments } from '../api/search'
import type { SearchResult, HybridConfig } from '../api/types'

export function DocumentSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [hybridConfig, setHybridConfig] = useState<HybridConfig>({
    semanticWeight: 0.7,
    keywordWeight: 0.3
  })

  const handleSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true)
    setError(null)
    setDebugInfo(null)
    
    try {
      const response = await searchDocuments({
        query: searchQuery,
        namespaceId: import.meta.env.VITE_NAMESPACE_ID,
        searchType: 'HYBRID',
        hybridConfig
      })

      setDebugInfo(response)
      setResults(response.data.results)
      
      if (response.data.results.length === 0) {
        setError('No results found for: ' + searchQuery)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [hybridConfig])

  // Add configuration controls to the UI
  const renderSearchConfig = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Search Configuration</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Semantic Weight</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={hybridConfig.semanticWeight}
            onChange={(e) => setHybridConfig(prev => ({
              semanticWeight: parseFloat(e.target.value),
              keywordWeight: 1 - parseFloat(e.target.value)
            }))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{hybridConfig.semanticWeight}</span>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Keyword Weight</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={hybridConfig.keywordWeight}
            onChange={(e) => setHybridConfig(prev => ({
              semanticWeight: 1 - parseFloat(e.target.value),
              keywordWeight: parseFloat(e.target.value)
            }))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{hybridConfig.keywordWeight}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Documents</h2>
      {renderSearchConfig()}  {/* Add the configuration controls */}
      {/* Search Input Section */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Enter your search query"
          className="flex-1 px-4 py-2 text-gray-900 border border-gray-200 rounded-lg 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent transition duration-200"
        />
        
        <button
          onClick={() => handleSearch(query)}
          disabled={isSearching}
          className={`px-6 py-2 text-white rounded-lg font-medium transition duration-200
            ${isSearching 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching...
            </span>
          ) : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 
                           transition duration-200"
              >
                <div className="mb-3 text-gray-900 whitespace-pre-wrap">
                  {result.content}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                                 bg-blue-100 text-blue-800">
                    Score: {(result.score * 100).toFixed(1)}%
                  </span>
                  {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-2.5 py-0.5 
                                             rounded-full bg-gray-100 text-gray-700">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="font-medium mb-2">Debug Info:</div>
          <div className="mb-1">Namespace ID: {import.meta.env.VITE_NAMESPACE_ID}</div>
          <div className="mb-2">Request Parameters:</div>
          <pre className="p-3 bg-white rounded-lg border border-gray-200 overflow-auto">
            {JSON.stringify({
              query: query || '[Click a test query]',
              namespaceId: import.meta.env.VITE_NAMESPACE_ID,
              topK: 15,
              scoreThreshold: 0.3,
              searchType: "HYBRID",
              hybridConfig: {
                semanticWeight: hybridConfig.semanticWeight,
                keywordWeight: hybridConfig.keywordWeight
              }
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
