'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDatastore } from '@/contexts/DatastoreContext';
import { format } from 'date-fns';

// Interface for the version data from API
interface Version {
  version: string;
  createdTime: string;
  contentLength: number;
  deleted: boolean;
  objectCreatedTime?: string;
}

interface VersionSelectorProps {
  selectedDatastore: string | null;
  selectedEntryKey: string | null;
}

export function VersionSelector({ selectedDatastore, selectedEntryKey }: VersionSelectorProps) {
  const { fetchEntryVersions, selectedVersion, setSelectedVersion } = useDatastore();

  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset versions when selectedEntryKey changes
  useEffect(() => {
    setVersions([]);
    // Also clear the selected version when changing entries
    setSelectedVersion(null);
  }, [selectedEntryKey, setSelectedVersion]);

  const loadVersions = async () => {
    if (!selectedDatastore || !selectedEntryKey) return;

    setLoading(true);

    try {
      // Call the fetchEntryVersions method from DatastoreContext
      const response = await fetchEntryVersions(selectedDatastore, selectedEntryKey);
      console.log('Versions data:', response);

      // Use the actual versions from the API response
      if (response && Array.isArray(response)) {
        setVersions(response);
      } else {
        console.warn('Unexpected versions response format:', response);
        setVersions([]);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = async (version: Version) => {
    // Just update the selected version in the context
    setSelectedVersion(version);

    // No need to call fetchEntryVersion here anymore
    // The EntryDetailPanel will react to the selectedVersion change
    // and call fetchEntryVersion as needed
    console.log(`Selected version ${version.version} of ${selectedEntryKey}`);
  };

  // Format the date for display using local time
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      console.warn('Error formatting date:', dateString, e);
      return dateString;
    }
  };

  // Format the version ID for display (shortened)
  const formatVersion = (version: string) => {
    if (version.length > 12) {
      return version.substring(0, 8) + '...';
    }
    return version;
  };

  // Format the content size for display
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!selectedDatastore || !selectedEntryKey) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-md">
      <div className="flex-1">
        <h4 className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Version History
        </h4>
        {selectedVersion && (
          <p className="text-xs text-muted-foreground">
            Viewing: {formatVersion(selectedVersion.version)} (
            {formatDate(selectedVersion.createdTime)})
            {selectedVersion.contentLength && ` - ${formatSize(selectedVersion.contentLength)}`}
            {selectedVersion.deleted && ' (Deleted)'}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {versions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                Select Version <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {versions.map((version) => (
                <DropdownMenuItem
                  key={version.version}
                  onClick={() => handleVersionSelect(version)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="font-medium">{formatVersion(version.version)}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(version.createdTime)}</span>
                    <span>{formatSize(version.contentLength)}</span>
                    {version.deleted && <span className="text-red-500">(Deleted)</span>}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button variant="outline" size="sm" onClick={loadVersions} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          List Versions
        </Button>
      </div>
    </div>
  );
}
