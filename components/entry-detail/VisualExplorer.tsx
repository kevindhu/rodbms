'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import { Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define proper types for JSON values
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Props for the main component
interface VisualExplorerProps {
  data: JsonValue | null;
  isLoading: boolean;
  onDataChange: (data: JsonValue) => void;
}

// Props for the edit interface components
interface EditInterfaceProps {
  value: JsonValue;
  editValue: string;
  setEditValue: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Props for primitive value display
interface ValueDisplayProps {
  value: JsonValue;
  path: string;
  onEdit: (path: string, value: JsonValue) => void;
}

// Props for collection components (arrays and objects)
interface CollectionProps {
  value: JsonValue;
  path: string;
  isExpanded: boolean;
  togglePath: (path: string) => void;
  renderNode: (value: JsonValue, path: string) => ReactNode;
}

// Boolean value editor component
function BooleanEditor({ value, editValue, setEditValue, onSave, onCancel }: EditInterfaceProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        autoFocus
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
      <Button size="sm" variant="ghost" onClick={onSave}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

// Number value editor component
function NumberEditor({ value, editValue, setEditValue, onSave, onCancel }: EditInterfaceProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="h-8 w-32"
        autoFocus
      />
      <Button size="sm" variant="ghost" onClick={onSave}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

// String value editor component
function StringEditor({ value, editValue, setEditValue, onSave, onCancel }: EditInterfaceProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="h-8 min-w-[200px]"
        autoFocus
      />
      <Button size="sm" variant="ghost" onClick={onSave}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

// Edit button component
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
      onClick={onClick}
    >
      <span className="sr-only">Edit</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
      >
        <path
          d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        ></path>
      </svg>
    </Button>
  );
}

// Null value display component
function NullValue({ value, path, onEdit }: ValueDisplayProps) {
  return (
    <div className="flex items-center py-1 group">
      <span className="text-gray-500 font-mono">null</span>
      <EditButton onClick={() => onEdit(path, null)} />
    </div>
  );
}

// Boolean value display component
function BooleanValue({ value, path, onEdit }: ValueDisplayProps) {
  return (
    <div className="flex items-center py-1 group">
      <span
        className={
          value
            ? 'text-blue-600 dark:text-blue-400 font-mono'
            : 'text-red-600 dark:text-red-400 font-mono'
        }
      >
        {String(value)}
      </span>
      <EditButton onClick={() => onEdit(path, value)} />
    </div>
  );
}

// Number value display component
function NumberValue({ value, path, onEdit }: ValueDisplayProps) {
  return (
    <div className="flex items-center py-1 group">
      <span className="text-blue-600 dark:text-blue-400 font-mono">{value as number}</span>
      <EditButton onClick={() => onEdit(path, value)} />
    </div>
  );
}

// String value display component
function StringValue({ value, path, onEdit }: ValueDisplayProps) {
  return (
    <div className="flex items-center py-1 group">
      <span className="text-green-600 dark:text-green-400 font-mono">
        &ldquo;{value as string}&rdquo;
      </span>
      <EditButton onClick={() => onEdit(path, value)} />
    </div>
  );
}

// Array display component
function ArrayNode({ value, path, isExpanded, togglePath, renderNode }: CollectionProps) {
  return (
    <div className="py-1">
      <div
        className="flex items-center cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1"
        onClick={() => togglePath(path)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
        )}
        <span className="text-purple-600 dark:text-purple-400 font-medium">
          Array [{(value as JsonValue[]).length}]
        </span>
      </div>

      {isExpanded && (
        <div className="pl-4 mt-1 border-l border-border">
          {(value as JsonValue[]).map((item, index) => (
            <div key={index} className="py-1">
              <div className="flex items-start">
                <span className="text-muted-foreground mr-2 font-mono">{index}:</span>
                {renderNode(item, `${path}[${index}]`)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Object display component
function ObjectNode({ value, path, isExpanded, togglePath, renderNode }: CollectionProps) {
  const keys = Object.keys(value as Record<string, JsonValue>);

  return (
    <div className="py-1">
      <div
        className="flex items-center cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1"
        onClick={() => togglePath(path)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
        )}
        <span className="text-purple-600 dark:text-purple-400 font-medium">
          Object {`{${keys.length}}`}
        </span>
      </div>

      {isExpanded && (
        <div className="pl-4 mt-1 border-l border-border">
          {keys.map((key) => (
            <div key={key} className="py-1">
              <div className="flex items-start">
                <span className="text-orange-600 dark:text-orange-400 mr-2 font-mono">{key}:</span>
                {renderNode(
                  (value as Record<string, JsonValue>)[key],
                  path ? `${path}.${key}` : `.${key}`
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex justify-center items-center h-full text-muted-foreground">
      No data to display
    </div>
  );
}

// Main component
export function VisualExplorer({ data, isLoading, onDataChange }: VisualExplorerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const initializedRef = useRef(false);

  // Move initialization to useEffect to prevent infinite renders
  useEffect(() => {
    // Only run this once when data first loads
    if (data && !initializedRef.current) {
      const topLevelPaths = new Set(['']);
      if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach((key) => topLevelPaths.add(`.${key}`));
        setExpandedPaths(topLevelPaths);
      }
      initializedRef.current = true;
    }
  }, [data]);

  const togglePath = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  const startEditing = (path: string, value: JsonValue) => {
    setEditingPath(path);
    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
  };

  const saveEdit = (path: string) => {
    if (!path || path === '' || !data) return;

    try {
      // Parse the path to navigate the object
      const pathParts = path.split('.').filter((p) => p !== '');
      const newData: JsonValue = JSON.parse(JSON.stringify(data));

      // Try to parse the edit value based on the original type
      let parsedValue: JsonValue;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        // If parsing fails, treat as string
        parsedValue = editValue;
      }

      // Navigate to the parent object
      let current: Record<string, JsonValue> | JsonValue[] = newData as
        | Record<string, JsonValue>
        | JsonValue[];
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!isNaN(Number(part))) {
          // Array index
          if (Array.isArray(current)) {
            current = current[Number(part)] as Record<string, JsonValue> | JsonValue[];
          } else {
            throw new Error(
              `Cannot use numeric index on non-array at path: ${pathParts.slice(0, i).join('.')}`
            );
          }
        } else {
          // Object key
          if (!Array.isArray(current) && typeof current === 'object' && current !== null) {
            current = current[part] as Record<string, JsonValue> | JsonValue[];
          } else {
            throw new Error(
              `Cannot use string key on non-object at path: ${pathParts.slice(0, i).join('.')}`
            );
          }
        }
      }

      // Update the value
      const lastPart = pathParts[pathParts.length - 1];
      if (!isNaN(Number(lastPart))) {
        (current as JsonValue[])[Number(lastPart)] = parsedValue;
      } else {
        (current as Record<string, JsonValue>)[lastPart] = parsedValue;
      }

      // Update state
      onDataChange(newData);
      setEditingPath(null);
    } catch (err) {
      console.error('Failed to update value:', err);
    }
  };

  const cancelEdit = () => {
    setEditingPath(null);
  };

  // Render a node in the tree
  const renderNode = (value: JsonValue, path: string = '') => {
    // Handle editing state for this node
    if (editingPath === path) {
      const handleSave = () => saveEdit(path);

      if (typeof value === 'boolean') {
        return (
          <BooleanEditor
            value={value}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        );
      } else if (typeof value === 'number') {
        return (
          <NumberEditor
            value={value}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        );
      } else if (typeof value === 'string') {
        return (
          <StringEditor
            value={value}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        );
      }
    }

    // Handle primitive values
    if (value === null) {
      return <NullValue value={value} path={path} onEdit={startEditing} />;
    }

    if (typeof value === 'boolean') {
      return <BooleanValue value={value} path={path} onEdit={startEditing} />;
    }

    if (typeof value === 'number') {
      return <NumberValue value={value} path={path} onEdit={startEditing} />;
    }

    if (typeof value === 'string') {
      return <StringValue value={value} path={path} onEdit={startEditing} />;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <ArrayNode
          value={value}
          path={path}
          isExpanded={expandedPaths.has(path)}
          togglePath={togglePath}
          renderNode={renderNode}
        />
      );
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <ObjectNode
          value={value}
          path={path}
          isExpanded={expandedPaths.has(path)}
          togglePath={togglePath}
          renderNode={renderNode}
        />
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="min-h-[400px] border rounded-md overflow-auto bg-card">
      {isLoading ? (
        <LoadingState />
      ) : data ? (
        <div className="p-4 overflow-auto">{renderNode(data)}</div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
