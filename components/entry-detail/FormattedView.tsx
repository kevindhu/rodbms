'use client';

import { JSX } from 'react';
import { Loader2 } from 'lucide-react';
import { JsonValue } from '@/components/explorer/EntryDetailPanel';

interface FormattedViewProps {
  data: JsonValue | null;
  isLoading: boolean;
}

export function FormattedView({ data, isLoading }: FormattedViewProps) {
  const renderFormattedView = () => {
    if (!data) {
      return <div className="text-muted-foreground">No data to display</div>;
    }

    return renderObjectTree(data, 0);
  };

  const renderObjectTree = (obj: JsonValue, depth: number): JSX.Element => {
    if (obj === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (Array.isArray(obj)) {
      return (
        <div className={depth > 0 ? 'pl-4 border-l border-border' : ''}>
          {obj.length === 0 ? (
            <span className="text-gray-500">[]</span>
          ) : (
            obj.map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-gray-500 mr-2">[{index}]</span>
                {typeof item === 'object' && item !== null ? (
                  renderObjectTree(item, depth + 1)
                ) : (
                  <span
                    className={`${
                      typeof item === 'string'
                        ? 'text-green-600 dark:text-green-400'
                        : typeof item === 'number'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {JSON.stringify(item)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      );
    }

    if (typeof obj === 'object') {
      return (
        <div className={depth > 0 ? 'pl-4 border-l border-border' : ''}>
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="py-1">
              <span className="font-medium mr-2">{key}:</span>
              {typeof value === 'object' && value !== null ? (
                renderObjectTree(value, depth + 1)
              ) : (
                <span
                  className={`${
                    typeof value === 'string'
                      ? 'text-green-600 dark:text-green-400'
                      : typeof value === 'number'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {JSON.stringify(value)}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(obj)}</span>;
  };

  return (
    <div className="min-h-[400px] p-4 border rounded-md overflow-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      ) : (
        renderFormattedView()
      )}
    </div>
  );
}
