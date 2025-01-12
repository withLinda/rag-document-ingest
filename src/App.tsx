import { DocumentIngest } from './components/DocumentIngest'
import { DocumentSearch } from './components/DocumentSearch'
import { DocumentDelete } from './components/DocumentDelete'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          RAG Document Search
        </h1>

        <DocumentIngest />
        <DocumentSearch />
        <DocumentDelete />
      </div>
    </div>
  )
}

export default App