import { useState } from 'react';
import { deleteDocuments } from '../api/delete';
import { MetadataInput } from './MetadataInput';
import type { DeleteResponse } from '../api/types';

export function DocumentDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    if (Object.keys(metadata).length === 0) {
      setError('Please specify at least one metadata filter');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response: DeleteResponse = await deleteDocuments(metadata);
      if (response.success) {
        setSuccessMessage(response.message || 'Documents deleted successfully');
        setMetadata({}); // Reset metadata after successful deletion
      } else {
        // Enhanced error handling
        let errorMessage = response.error?.message || 'Delete operation failed';
        
        // Add detailed error information if available
        if (response.error?.details?.errors) {
          const details = response.error.details.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join('\n');
          errorMessage += `\nDetails:\n${details}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Delete Documents</h2>
      
      <div className="mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Warning: This will permanently delete all documents matching the specified metadata filters.
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <MetadataInput
          onChange={setMetadata}
          initialMetadata={{}}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDelete}
          disabled={isDeleting || Object.keys(metadata).length === 0}
          className={`px-6 py-3 text-white rounded-lg font-medium transition duration-200
            ${isDeleting || Object.keys(metadata).length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 active:bg-red-800'}`}
        >
          {isDeleting ? 'Deleting...' : 'Delete Matching Documents'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-lg border border-green-100">
          {successMessage}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all documents matching these metadata filters?
              <br /><br />
              Filters:
              <pre className="bg-gray-50 p-2 rounded mt-2 text-sm">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
