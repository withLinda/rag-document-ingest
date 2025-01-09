import { useState } from 'react'
import { ingestDocument, waitForCompletion } from '../api/ingest'

export function DocumentIngest() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ingestResponse, setIngestResponse] = useState<any>(null) // Store the complete response

  const sampleText = `Our Enterprise plan includes advanced security features for large organizations. Key features:

1. Single Sign-On (SSO): Integrate with your existing identity provider (Okta, Azure AD, etc.) for seamless access control.

2. Role-Based Access: Granular permissions let you control who can view, edit, or manage different parts of the system.

3. Audit Logging: Track all system activities with detailed logs for compliance and security monitoring.

4. Custom SLAs: Get guaranteed 99.9% uptime with 24/7 priority support.`

  const handleIngest = async () => {
    setIsProcessing(true)
    setError(null)
    setStatus('Starting ingestion...')
    setIngestResponse(null)

    try {
      const content = await ingestDocument(sampleText)
      console.log('Initial ingest response:', content)
      setIngestResponse(content)
      setStatus(`Document submitted with ID: ${content.data.ingestJobRunId}`)

      await waitForCompletion(content.data.ingestJobRunId, (currentStatus) => {
        setStatus(`Processing: ${currentStatus}`)
        console.log('Current status:', currentStatus)
      })

      setStatus('✅ Document processed successfully!')
    } catch (err) {
      console.error('Ingest error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStatus('❌ Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0 }}>Document Ingestion</h2>
      
      <div style={{ 
        backgroundColor: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Sample Text to Ingest:</h3>
        <pre style={{ 
          margin: 0,
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          color: '#334155'
        }}>
          {sampleText}
        </pre>
      </div>

      <button
        onClick={handleIngest}
        disabled={isProcessing}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isProcessing ? '#94a3b8' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isProcessing ? 'wait' : 'pointer'
        }}
      >
        {isProcessing ? 'Processing...' : 'Ingest Document'}
      </button>

      {status && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: status.includes('✅') ? '#f0fdf4' : '#f8fafc',
          borderRadius: '5px',
          border: '1px solid #e2e8f0',
          color: status.includes('✅') ? '#047857' : '#1e293b'
        }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#fef2f2',
          borderRadius: '5px',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Display the complete ingest response */}
      {ingestResponse && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0',
            fontSize: '16px'
          }}>
            Ingest Response
          </h3>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            color: '#334155',
            backgroundColor: '#ffffff',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            {JSON.stringify(ingestResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
