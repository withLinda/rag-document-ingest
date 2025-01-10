// src/components/ProcessingStatus.tsx
import { FC } from 'react';

export type ProcessingStatusType = 'QUEUED' | 'PRE_PROCESSING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export const ProcessingStatus: FC<ProcessingStatusProps> = ({ status }) => {
  const statusConfig = {
    QUEUED: {
      label: 'Request Queued',
      description: 'Your request has been accepted and is waiting to be processed',
      color: 'bg-yellow-500',
      icon: '⌛'
    },
    PRE_PROCESSING: {
      label: 'Initial Setup',
      description: 'Validating configuration and setting up processing',
      color: 'bg-blue-500',
      icon: '⚙️'
    },
    PROCESSING: {
      label: 'Processing',
      description: 'Documents are being processed',
      color: 'bg-purple-500',
      icon: '🔄'
    },
    COMPLETED: {
      label: 'Completed',
      description: 'All documents have been processed',
      color: 'bg-green-500',
      icon: '✅'
    },
    FAILED: {
      label: 'Failed',
      description: 'An error occurred during processing',
      color: 'bg-red-500',
      icon: '❌'
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Status Timeline */}
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 space-y-8 py-4">
          {Object.entries(statusConfig).map(([key, config], index) => {
            const isActive = Object.keys(statusConfig).indexOf(status) >= index;
            const isPast = Object.keys(statusConfig).indexOf(status) > index;
            
            return (
              <div key={key} className="flex items-center space-x-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 
                  ${isActive ? config.color : 'bg-gray-200'}
                  ${isPast ? 'opacity-50' : 'opacity-100'}
                `}>
                  <span className="text-sm">{config.icon}</span>
                </div>
                <div className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs">{config.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
