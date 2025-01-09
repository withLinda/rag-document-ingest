
# RAG Document Search Application

A modern React application for document ingestion and semantic search using RAGaaS (Retrieval Augmented Generation as a Service). Built with React 18, TypeScript, and Vite.

## 🚀 Features

- **Document Ingestion**
  - Text document processing
  - Chunk-based document splitting
  - Real-time ingestion status monitoring
  - Metadata support for document categorization

- **Semantic Search**
  - Natural language query processing
  - Score-based result ranking
  - Metadata filtering capabilities
  - Real-time search with detailed results

## 🛠️ Technology Stack

- **Frontend Framework:** React 18.3
- **Language:** TypeScript 5.6
- **Build Tool:** Vite 6.0
- **Development Tools:**
  - ESLint 9.x for code quality
  - Modern ESLint configuration with TypeScript support
  - React Hooks linting
  - React Refresh for fast development

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- RAGaaS API credentials
  - API Key
  - Namespace ID

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your RAGaaS credentials
   VITE_RAGAAS_API_KEY=your_api_key_here
   VITE_NAMESPACE_ID=your_namespace_id_here
   ```

## 🚀 Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## 🏛️ Project Structure

```
src/
├── api/                    # API integration layer
│   ├── config.ts          # API configuration
│   ├── ingest.ts          # Document ingestion endpoints
│   ├── search.ts          # Search functionality
│   └── types.ts           # TypeScript interfaces
├── components/            # React components
│   ├── DocumentIngest.tsx # Document ingestion UI
│   └── DocumentSearch.tsx # Search interface
└── App.tsx               # Main application component
```

## 🔌 API Integration

The application integrates with RAGaaS API for document processing and search:

1. **Document Ingestion**
   - Supports text ingestion with configurable chunking
   - Processes documents with metadata
   - Provides real-time ingestion status updates

2. **Search Functionality**
   - Semantic search with relevance scoring
   - Configurable result limits
   - Metadata-based filtering

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_RAGAAS_API_KEY | RAGaaS API authentication key | Yes |
| VITE_NAMESPACE_ID | RAGaaS namespace identifier | Yes |

### Vite Configuration

The application includes a proxy configuration for API requests:

```typescript
server: {
  proxy: {
    '/v1': {
      target: 'https://api.ragaas.dev',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🧪 TypeScript Configuration

The project uses a dual TypeScript configuration approach:
- `tsconfig.app.json`: Application-specific settings
- `tsconfig.node.json`: Node.js environment settings

## 📦 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [RAGaaS](https://ragaas.dev/)
```
