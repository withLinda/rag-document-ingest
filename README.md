# RAG Document Management System
<img width="713" alt="Screenshot 2025-01-12 145233" src="https://github.com/user-attachments/assets/a2c3e92c-8e2a-4be6-9fbf-7d4bc3989f12" />

A modern React application leveraging [RAGaaS.dev)](https://ragaas.dev) for intelligent document management and semantic search capabilities. This application provides a seamless interface for document ingestion, metadata management, and context-aware document retrieval.

## 🌟 Features

### Document Management
- **Intelligent Document Ingestion**
  - PDF document processing
  - Automatic text chunking
  - Metadata tagging system
  - Real-time processing status
  - Configurable chunk sizes and overlap

### Search Capabilities
- **Advanced Semantic Search**
  - Natural language queries
  - Hybrid search (combining semantic and keyword matching)
  - Configurable search weights
  - Metadata-based filtering
  - Relevance scoring

### Document Control
- **Document Lifecycle Management**
  - Metadata-based document filtering
  - Selective document deletion
  - Batch operations support
  - Processing status tracking

## 🛠️ Technology Stack

- **Frontend Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite 6.0
- **Styling:** TailwindCSS
- **API Integration:** RAGaaS REST API
- **State Management:** React Hooks
- **Type Checking:** TypeScript 5.6

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- RAGaaS API credentials:
  - API Key
  - Namespace ID

## 🚀 Getting Started

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd rag-document-manager
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your RAGaaS credentials
   VITE_RAGAAS_API_KEY=your_api_key_here
   VITE_NAMESPACE_ID=your_namespace_id_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🏗️ Project Structure

```
src/
├── api/                # API integration layer
│   ├── config.ts      # API configuration
│   ├── delete.ts      # Document deletion
│   ├── ingest.ts      # Document ingestion
│   ├── search.ts      # Search functionality
│   └── types.ts       # TypeScript interfaces
├── components/        # React components
│   ├── DocumentDelete.tsx    # Document deletion UI
│   ├── DocumentIngest.tsx    # Document ingestion UI
│   ├── DocumentSearch.tsx    # Search interface
│   ├── MetadataInput.tsx    # Metadata management
│   └── ProcessingStatus.tsx  # Status indicators
└── App.tsx           # Main application component
```

## 🔌 API Integration

### Document Ingestion
```typescript
// Example: Ingest a PDF document with metadata
await ingestPDF(file, {
  docType: 'technical',
  department: 'engineering'
});
```

### Semantic Search
```typescript
// Example: Perform a hybrid search
await searchDocuments({
  query: "security protocols",
  hybridConfig: {
    semanticWeight: 0.7,
    keywordWeight: 0.3
  }
});
```

### Document Deletion
```typescript
// Example: Delete documents by metadata
await deleteDocuments({
  status: 'archived',
  department: 'hr'
});
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_RAGAAS_API_KEY | RAGaaS API key | Yes |
| VITE_NAMESPACE_ID | Document namespace ID | Yes |

### Build Configuration
The application uses Vite with the following optimizations:
- API proxy configuration for development
- TypeScript path aliases
- Environment variable typing
- Production build optimization

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Type Checking
```bash
npm run type-check
# or
yarn type-check
```

## 📚 Documentation

For detailed API documentation, visit:
- [RAGaaS Documentation](https://ragaas.dev/docs)
- [API Reference](https://ragaas.dev/api-reference)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [RAGaaS](https://ragaas.dev) for providing the backend infrastructure
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
