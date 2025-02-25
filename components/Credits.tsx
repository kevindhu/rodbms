import { Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Credits() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <span>Created by verticalfx</span>
        <a href="https://github.com/verticalfx" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Github className="h-4 w-4" />
          </Button>
        </a>
        <a href="https://twitter.com/strawhatvert" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Twitter className="h-4 w-4" />
          </Button>
        </a>
      </div>
      <div className="text-[10px] text-muted-foreground/70 max-w-md text-center">
        This tool is not affiliated with, endorsed by, or associated with Roblox Corporation. 
        All Roblox trademarks, service marks, trade names, and logos are the property of Roblox Corporation.
      </div>
    </div>
  );
} 