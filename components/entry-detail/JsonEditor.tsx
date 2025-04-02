'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
    </div>
  ),
});

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  isLoading: boolean;
}

export function JsonEditor({ value, onChange, isLoading }: JsonEditorProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }

  return (
    <MonacoEditor
      height="400px"
      language="json"
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
}
