"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface VersionInfo {
  version: string;
  createdTime: string;
  deleted: boolean;
}

interface EntryDetailEditorProps {
  universeId: string;
  apiToken: string;
  datastoreName: string;
  entryKey: string;
}

export default function EntryDetailEditor({
  universeId,
  apiToken,
  datastoreName,
  entryKey,
}: EntryDetailEditorProps) {
  const [entryData, setEntryData] = useState<string>("");
  const { toast } = useToast();

  // Versioning
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetchEntryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Fetch the current entry data and load into editor. */
  async function fetchEntryDetail() {
    const url = `/api/datastores/${encodeURIComponent(
      datastoreName
    )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${entryKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      toast({
        title: "Error",
        description: "Failed to fetch entry: " + data.error,
        variant: "destructive",
      });
      return;
    }
    setEntryData(JSON.stringify(data, null, 2));
  }

  /** Save the current editor contents back to the Roblox datastore. */
  async function handleSave() {
    try {
      const parsedValue = JSON.parse(entryData);
      const body = {
        entryKey,
        value: parsedValue,
      };
      const res = await fetch(
        `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry?universeId=${universeId}&apiToken=${apiToken}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      const result = await res.json();
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to save: " + result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Entry saved successfully!",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "JSON parse error: " + err,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    console.log("EntryDetailEditor MOUNTED with entryKey =", entryKey);
  }, [entryKey]);

  /** Toggle showing/hiding the version history panel. If showing, fetch versions. */
  async function handleToggleVersions() {
    console.log("handleToggleVersions called");
    setShowVersions(!showVersions);
    if (!showVersions) {
      // user is opening the panel, so fetch version list
      const url = `/api/datastores/${encodeURIComponent(
        datastoreName
      )}/entry/versions?universeId=${universeId}&apiToken=${apiToken}&entryKey=${entryKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Error",
          description: "Failed to fetch versions: " + data.error,
          variant: "destructive",
        });
        return;
      }
      if (data.versions) {
        setVersions(data.versions);
      } else {
        setVersions([]);
      }
    }
  }

  /** Load a specific version's data and replace the editor contents. */
  async function handleLoadVersion(versionId: string) {
    const url = `/api/datastores/${encodeURIComponent(
      datastoreName
    )}/entry/versions/version?universeId=${universeId}&apiToken=${apiToken}&entryKey=${entryKey}&versionId=${versionId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      toast({
        title: "Error",
        description: "Failed to load version: " + data.error,
        variant: "destructive",
      });
      return;
    }
    setEntryData(JSON.stringify(data, null, 2));
    toast({
      title: "Version Loaded",
      description: "You can now save to overwrite the current data with this version.",
    });
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500">
        <CardTitle className="text-white">Editing: {entryKey}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300"
          >
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleToggleVersions} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300"
          >
            {showVersions ? "Hide Versions" : "Show Versions"}
            lol
          </Button>
        </div>

        {showVersions && (
          <div className="p-2 mb-4 border rounded-md bg-slate-50">
            <h3 className="font-bold mb-2">Versions</h3>
            {versions.length === 0 && <p className="text-sm text-slate-600">No versions found.</p>}
            {versions.map((v) => (
              <div
                key={v.version}
                className="flex items-center justify-between p-2 border-b last:border-none"
              >
                <div>
                  <p className="font-mono text-sm">Version: {v.version}</p>
                  <p className="text-xs text-slate-500">
                    Created: {v.createdTime} {v.deleted && "(deleted)"}
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleLoadVersion(v.version)}>
                  Load
                </Button>
              </div>
            ))}
          </div>
        )}

        <MonacoEditor
          height="400px"
          language="json"
          theme="vs-dark"
          value={entryData}
          onChange={(value) => setEntryData(value || "")}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
          }}
        />
      </CardContent>
    </Card>
  );
}
