import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MetadataInputProps {
  onChange: (metadata: Record<string, string>) => void;
  initialMetadata?: Record<string, string>;
}

interface PredefinedMetadata {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  defaultValue?: string | (() => string);
}

const PREDEFINED_FIELDS: PredefinedMetadata[] = [
  {
    key: 'docAuthor',
    label: 'Document Author',
    type: 'text',
    required: true,
  },
  {
    key: 'docType',
    label: 'Document Type',
    type: 'select',
    required: true,
    options: ['pdf', 'text', 'article', 'url', 'other'],
  },
  {
    key: 'docSection',
    label: 'Document Section',
    type: 'select',
    required: true,
    options: ['general-knowledge', 'code-documentation', 'book', 'book-summary', 'other'],
  },
  {
    key: 'docSubsection',
    label: 'Document Subsection',
    type: 'text',
  },
  {
    key: 'docID',
    label: 'Document ID',
    type: 'text',
    required: true,
    defaultValue: `DOC-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
  }
];

export function MetadataInput({ onChange, initialMetadata = {} }: MetadataInputProps): ReactNode {
  const [predefinedValues, setPredefinedValues] = useState<Record<string, string>>(() => {
    const defaults = PREDEFINED_FIELDS.reduce((acc, field) => {
      acc[field.key] = typeof field.defaultValue === 'function'
        ? field.defaultValue()
        : field.defaultValue || '';
      return acc;
    }, {} as Record<string, string>);
    return { ...defaults, ...initialMetadata };
  });

  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    const combinedMetadata = {
      ...predefinedValues,
      ...Object.fromEntries(
        customFields
          .filter(field => field.key.trim() !== '')
          .map(field => [field.key, field.value])
      ),
    };
    onChange(combinedMetadata);
  }, [predefinedValues, customFields, onChange]);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Document Metadata
        </h3>

        {/* Predefined Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {PREDEFINED_FIELDS.map(field => (
            <div key={field.key} className="space-y-2">
              <label
                htmlFor={field.key}
                className="flex items-center gap-1 text-sm font-medium text-gray-700"
              >
                {field.label}
                {field.required && (
                  <span className="text-red-500">*</span>
                )}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.key}
                  value={predefinedValues[field.key]}
                  onChange={(e) => setPredefinedValues(prev => ({ 
                    ...prev, 
                    [field.key]: e.target.value 
                  }))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg 
                           text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition duration-200"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.key}
                  value={predefinedValues[field.key]}
                  onChange={(e) => setPredefinedValues(prev => ({ 
                    ...prev, 
                    [field.key]: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition duration-200"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        {/* Custom Fields Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">
              Custom Fields
            </h4>
            <button
              onClick={() => setCustomFields(prev => [...prev, { key: '', value: '' }])}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg 
                       hover:bg-blue-700 active:bg-blue-800 transition duration-200"
            >
              Add Custom Field
            </button>
          </div>

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index] = { ...field, key: e.target.value };
                    setCustomFields(newFields);
                  }}
                  placeholder="Custom Field Name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index] = { ...field, value: e.target.value };
                    setCustomFields(newFields);
                  }}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent"
                />
                <button
                  onClick={() => setCustomFields(fields => fields.filter((_, i) => i !== index))}
                  className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 
                           active:bg-red-700 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
