"use client";

import { useState } from "react";
import { useDatastore } from "@/contexts/DatastoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";

export function CreateDatastore() {
  const { createDatastore, isLoading } = useDatastore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDatastoreName, setNewDatastoreName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDatastore = async () => {
    if (!newDatastoreName.trim()) return;
    
    setIsCreating(true);
    const success = await createDatastore(newDatastoreName.trim());
    setIsCreating(false);
    
    if (success) {
      setIsDialogOpen(false);
      setNewDatastoreName("");
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        New Datastore
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Datastore</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="datastoreName" className="block mb-2">
              Datastore Name
            </Label>
            <Input
              id="datastoreName"
              value={newDatastoreName}
              onChange={(e) => setNewDatastoreName(e.target.value)}
              placeholder="Enter datastore name"
              className="w-full"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDatastore}
              disabled={!newDatastoreName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Datastore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 