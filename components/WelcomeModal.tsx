"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Heart, Star } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem("welcomeModalSeen");
    if (!hasVisitedBefore) {
      setIsOpen(true);
    }
  }, []);
  
  const handleClose = () => {
    localStorage.setItem("welcomeModalSeen", "true");
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">👋</span> Welcome to Datastore Explorer!
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Your friendly tool for managing Roblox datastores with ease.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="font-medium">Easy to Use</h3>
              <p className="text-sm text-muted-foreground">Connect with your Universe ID and API Token to get started.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔍</div>
            <div>
              <h3 className="font-medium">Powerful Exploration</h3>
              <p className="text-sm text-muted-foreground">Browse, search, and edit your datastores with a visual interface.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">🌓</div>
            <div>
              <h3 className="font-medium">Light & Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Work comfortably day or night with theme support.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">💻</div>
            <div>
              <h3 className="font-medium">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                This project is open source and contributions are welcome!
              </p>
              <div className="mt-2">
                <a 
                  href="https://github.com/yourusername/datastore-explorer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Github size={14} /> View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => window.open("https://github.com/yourusername/datastore-explorer", "_blank")}
          >
            <Star size={16} /> Star on GitHub
          </Button>
          <Button onClick={handleClose} className="flex items-center gap-1">
            <Heart size={16} /> Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 