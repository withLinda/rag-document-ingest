/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RAGAAS_API_KEY: string
    readonly VITE_NAMESPACE_ID: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  