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
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
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