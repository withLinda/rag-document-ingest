import { DocumentIngest } from './components/DocumentIngest'
import { DocumentSearch } from './components/DocumentSearch'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{ 
          marginBottom: '30px',
          color: '#1e293b'
        }}>
          RAG Document Search
        </h1>

        <DocumentIngest />
        <DocumentSearch />
      </div>
    </div>
  )
}

export default App
