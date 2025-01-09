import { useState, useCallback } from 'react'
import { searchDocuments } from '../api/search'
import type { SearchResult } from '../api/types'

export function DocumentSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)


  const handleSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true)
    setError(null)
    setDebugInfo(null)
    
    try {
      const response = await searchDocuments({
        query: searchQuery,
        namespaceId: import.meta.env.VITE_NAMESPACE_ID,
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
  }, [])

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: '20px'
    }}>
      <h2 style={{ marginTop: 0 }}>Search Documents</h2>
      
      {/* Custom search */}
      <div style={{ 
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Enter your search query"
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          }}
        />
        
        <button
          onClick={() => handleSearch(query)}
          disabled={isSearching}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isSearching ? '#94a3b8' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSearching ? 'wait' : 'pointer',
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>


      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '4px',
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          {error}
        </div>
      )}

      {/* Search Results Section */}
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>Search Results</h3>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '15px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ 
                marginBottom: '10px',
                color: '#1e293b',
                whiteSpace: 'pre-wrap'
              }}>
                {result.content}
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <span>
                  Score: {(result.score * 100).toFixed(1)}%
                </span>
                {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                  <span key={key}>
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {debugInfo && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0',
            color: '#1e293b',
            fontSize: '16px'
          }}>
            API Response
          </h3>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            color: '#334155',
            backgroundColor: '#ffffff',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            overflow: 'auto'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#64748b',
      }}>
        <div>Debug Info:</div>
        <div>Namespace ID: {import.meta.env.VITE_NAMESPACE_ID}</div>
        <div>Request Parameters:</div>
        <pre style={{ margin: '5px 0' }}>
          {JSON.stringify({
            query: query || '[Click a test query]',
            namespaceId: import.meta.env.VITE_NAMESPACE_ID,
            topK: 10,
            minScore: 0.0
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
