"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, RefreshCw, Download, Upload, 
  Copy, Trash2, Filter, SortAsc, SortDesc 
} from "lucide-react";
import { useDatastore } from "@/contexts/DatastoreContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function QuickActionBar() {
  const { selectedDatastore, fetchEntries, selectedEntryKey } = useDatastore();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");

  const handleRefresh = async () => {
    if (!selectedDatastore) return;
    
    try {
      await fetchEntries(selectedDatastore);
      toast("Refreshed", "success");
    } catch (error) {
      toast("Failed to refresh entries", "error");
    }
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const downloadExport = () => {
    // Implementation for exporting data
    setIsExportDialogOpen(false);
    toast("Exported", "success");
  };

  const processImport = () => {
    // Implementation for importing data
    setIsImportDialogOpen(false);
    toast("Imported", "success");
  };

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={handleRefresh}
        disabled={!selectedDatastore}
        title="Refresh entries"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={handleExport}
        disabled={!selectedDatastore}
        title="Export data"
      >
        <Download className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={handleImport}
        disabled={!selectedDatastore}
        title="Import data"
      >
        <Upload className="h-4 w-4" />
      </Button>
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        title="Sort ascending"
      >
        <SortAsc className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        title="Sort descending"
      >
        <SortDesc className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        title="Filter entries"
      >
        <Filter className="h-4 w-4" />
      </Button>
      
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Choose export format:</p>
            <div className="flex gap-2">
              <Button onClick={downloadExport} className="flex-1">JSON</Button>
              <Button onClick={downloadExport} className="flex-1">CSV</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Paste your JSON data below:</p>
            <textarea 
              className="w-full h-32 p-2 border rounded-md"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={processImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 