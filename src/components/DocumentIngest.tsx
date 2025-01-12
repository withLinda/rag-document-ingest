import { useState, useRef, useCallback } from 'react';
import { ingestDocument, waitForCompletion } from '../api/ingest'; // Added waitForCompletion to import
import { MetadataInput } from './MetadataInput';
import { ProcessingStatusType } from './ProcessingStatus';

interface UploadState {
  selectedFile: File | null;
  isProcessing: boolean;
  uploadProgress: number;
  processingStatus: ProcessingStatusType;
  statusMessage: string;
  error: string | null;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Define supported file extensions and their friendly names
const SUPPORTED_FORMATS = {
  pdf: { extensions: ['.pdf'], label: 'PDF documents' },
  text: { 
    extensions: ['.txt', '.csv', '.json', '.xml', '.md'], 
    label: 'Text based formats' 
  },
  word: { extensions: ['.doc', '.docx'], label: 'Word documents' },
  excel: { extensions: ['.xls', '.xlsx'], label: 'Excel documents' },
  powerpoint: { 
    extensions: ['.ppt', '.pptx'], 
    label: 'PowerPoint documents' 
  },
  archive: { extensions: ['.zip'], label: 'ZIP files' }
};

// Create accept string for file input
const ACCEPT_STRING = Object.values(SUPPORTED_FORMATS)
  .map(format => format.extensions)
  .flat()
  .join(',');

export function DocumentIngest() {
  const [uploadState, setUploadState] = useState<UploadState>({
    selectedFile: null,
    isProcessing: false,
    uploadProgress: 0,
    processingStatus: 'QUEUED',
    statusMessage: '',
    error: null,
  });

  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file extension is supported
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isSupported = Object.values(SUPPORTED_FORMATS)
      .some(format => format.extensions.includes(extension));

    if (!isSupported) {
      setUploadState(prev => ({
        ...prev,
        error: 'Unsupported file format. Please select a supported document type.',
        selectedFile: null
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      error: null,
      statusMessage: '',
      uploadProgress: 0
    }));
  }, []);

  const handleDocumentIngest = useCallback(async () => {
    if (!uploadState.selectedFile) {
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      processingStatus: 'QUEUED',
      statusMessage: 'Starting document processing...'
    }));

    try {
      const response = await ingestDocument(uploadState.selectedFile, metadata);
      const jobId = response.data.ingestJobRunId;

      const handleStatusUpdate = (status: string) => {
        setUploadState(prev => ({
          ...prev,
          processingStatus: status as ProcessingStatusType,
          statusMessage: `Processing status: ${status}`
        }));
      };

      await waitForCompletion(jobId, handleStatusUpdate);

      setUploadState(prev => ({
        ...prev,
        isProcessing: false,
        processingStatus: 'COMPLETED',
        statusMessage: '✅ Document processed successfully',
        selectedFile: null
      }));

    } catch (err) {
      setUploadState(prev => ({
        ...prev,
        isProcessing: false,
        processingStatus: 'FAILED',
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
        statusMessage: ''
      }));
    }
  }, [uploadState.selectedFile, metadata]);

  const getUploadButtonState = () => {
    if (uploadState.isProcessing) {
      return {
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
        text: 'Processing...',
        showSpinner: true
      };
    }
    return {
      disabled: false,
      className: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      text: 'Upload and Process',
      showSpinner: false
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Document Upload & Metadata
      </h2>

      {/* Supported Formats Info Box */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Supported Document Formats
        </h3>
        <div className="text-sm text-blue-700">
          <p className="mb-2">Directly upload files from your local machine or cloud storage. Supports:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>PDF documents (.pdf)</li>
            <li>Text based formats (.csv, .json, .xml, .txt, .md, etc.)</li>
            <li>Word documents (.docx, .doc)</li>
            <li>Excel documents (.xlsx, .xls)</li>
            <li>PowerPoint documents (.pptx, .ppt)</li>
            <li>ZIP files (.zip)</li>
            <li>And more common document formats</li>
          </ul>
        </div>
      </div>

      <MetadataInput
        onChange={setMetadata}
        initialMetadata={{
          docPublishedDate: new Date().toISOString().split('T')[0],
          docType: 'document'
        }}
      />

      <div className="mt-6 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Document file upload"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {!uploadState.selectedFile ? (
            <>
              <div className="text-gray-500 text-lg">
                Upload your document
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState.isProcessing}
                className="px-6 py-3 text-white rounded-lg font-medium transition duration-200
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                aria-label="Select document file"
              >
                Select Document
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>
                  {uploadState.selectedFile.name} 
                  ({formatFileSize(uploadState.selectedFile.size)})
                </span>
              </div>

              <button
                onClick={handleDocumentIngest}
                disabled={uploadState.isProcessing}
                className={`w-full px-6 py-3 text-white rounded-lg font-medium 
                         transition duration-200 flex items-center justify-center gap-2
                         ${getUploadButtonState().className}`}
                aria-label="Upload and process document"
              >
                {getUploadButtonState().showSpinner && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {getUploadButtonState().text}
              </button>
            </div>
          )}
        </div>

        {uploadState.uploadProgress > 0 && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadState.uploadProgress}%` }}
              role="progressbar"
              aria-valuenow={uploadState.uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
      </div>

      {uploadState.statusMessage && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadState.statusMessage.includes('✅') 
            ? 'bg-green-50 text-green-800' 
            : uploadState.statusMessage.includes('⚠️') 
              ? 'bg-yellow-50 text-yellow-800' 
              : 'bg-gray-50 text-gray-800'
        }`}>
          {uploadState.statusMessage}
        </div>
      )}

      {uploadState.error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {uploadState.error}
        </div>
      )}
    </div>
  );
}
