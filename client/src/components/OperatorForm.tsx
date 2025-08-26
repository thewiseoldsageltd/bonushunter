import React from 'react';
import { Button } from "@/components/ui/button";

interface OperatorFormProps {
  operator?: any;
  onSuccess: () => void;
}

export const OperatorForm: React.FC<OperatorFormProps> = ({ operator, onSuccess }) => {
  return (
    <div className="p-4 text-center">
      <p className="text-gray-500 mb-4">
        Operator management is coming soon!
      </p>
      <Button onClick={onSuccess} variant="outline">
        Close
      </Button>
    </div>
  );
};