// DocumentIngest.tsx
import { useState, useRef, useCallback } from 'react';
import { ingestPDF, waitForCompletion } from '../api/ingest';
import { MetadataInput } from './MetadataInput';
import { ProcessingStatusType } from './ProcessingStatus';

// Hmm, we need some types first... Let me think about what interfaces we need
interface UploadState {
  selectedFile: File | null;
  isProcessing: boolean;
  uploadProgress: number;
  processingStatus: ProcessingStatusType;
  statusMessage: string;
  error: string | null;
}

// Let me think about utility functions we might need...
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export function DocumentIngest() {
  // Let's start with state management...
  // Hmm, should we split these into multiple useState calls or use a reducer?
  // For now, let's keep them separate for clarity, but we might want to refactor later
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

  // Now, let's think about the handlers...
  // We need to handle file selection, but also validate the file...
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a PDF file',
        selectedFile: null
      }));
      return;
    }

    // Check file size
    // Hmm, should we have a constant for max file size?
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const statusMessage = file.size > MAX_FILE_SIZE 
      ? `⚠️ Large file detected (${formatFileSize(file.size)}). Upload may take longer.`
      : '';

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      error: null,
      statusMessage,
      uploadProgress: 0
    }));
  }, []);

  // Now for the main processing function...
  // This is complex, let's think it through carefully...
  const handlePDFIngest = useCallback(async () => {
    if (!uploadState.selectedFile) {
      // Hmm, should we show an error here?
      return;
    }

    // Update state to show processing has started
    setUploadState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      processingStatus: 'QUEUED',
      statusMessage: 'Starting document processing...'
    }));

    try {
      // Start the upload process
      const response = await ingestPDF(uploadState.selectedFile, metadata);
      const jobId = response.data.ingestJobRunId;

      // Now we need to monitor the processing status
      // Let's create a status update handler
      const handleStatusUpdate = (status: string) => {
        setUploadState(prev => ({
          ...prev,
          processingStatus: status as ProcessingStatusType,
          statusMessage: `Processing status: ${status}`
        }));
      };

      // Wait for processing to complete
      await waitForCompletion(jobId, handleStatusUpdate);

      // Success! Update the state
      setUploadState(prev => ({
        ...prev,
        isProcessing: false,
        processingStatus: 'COMPLETED',
        statusMessage: '✅ Document processed successfully',
        selectedFile: null // Clear the file after successful processing
      }));

    } catch (err) {
      // Handle errors gracefully
      setUploadState(prev => ({
        ...prev,
        isProcessing: false,
        processingStatus: 'FAILED',
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
        statusMessage: ''
      }));
    }
  }, [uploadState.selectedFile, metadata]);

    // Helper function for the upload button state
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
  
    // Render function
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Document Upload & Metadata
        </h2>
  
        {/* Metadata Section */}
        <MetadataInput
          onChange={setMetadata}
          initialMetadata={{
            docPublishedDate: new Date().toISOString().split('T')[0],
            docType: 'pdf'
          }}
        />
  
        {/* Upload Section */}
        <div className="mt-6 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="PDF file upload"
          />
  
          <div className="flex flex-col items-center justify-center space-y-4">
            {!uploadState.selectedFile ? (
              // Initial upload state
              <>
                <div className="text-gray-500 text-lg">
                  Upload your PDF document
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadState.isProcessing}
                  className="px-6 py-3 text-white rounded-lg font-medium transition duration-200
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  aria-label="Select PDF file"
                >
                  Select PDF File
                </button>
              </>
            ) : (
              // File selected state
              <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                {/* File information */}
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
  
                {/* Upload button */}
                <button
                  onClick={handlePDFIngest}
                  disabled={uploadState.isProcessing}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium 
                           transition duration-200 flex items-center justify-center gap-2
                           ${getUploadButtonState().className}`}
                  aria-label="Upload and process PDF"
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
  
          {/* Progress bar */}
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
  
        {/* Status Messages */}
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
  
        {/* Error Messages */}
        {uploadState.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {uploadState.error}
          </div>
        )}
  
        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 space-y-1">
          <div className="text-sm">Supported format: PDF only</div>
          <div className="text-xs">
            Note: Large files may take longer to process
          </div>
        </div>
      </div>
    );
  }
  