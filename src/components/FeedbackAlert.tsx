import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface FeedbackAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const FeedbackAlert: React.FC<FeedbackAlertProps> = ({ 
  type, 
  children, 
  className = '' 
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500/50 text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`border px-4 py-3 rounded flex items-center gap-2 ${getAlertStyles()} ${className}`}>
      {getIcon()}
      <div>{children}</div>
    </div>
  );
};

export default FeedbackAlert;