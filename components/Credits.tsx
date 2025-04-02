import { Github, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Credits() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <span>Forked from verticalfx</span>
        <a href="https://github.com/kevindhu/rodbms" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Github className="h-4 w-4" />
          </Button>
        </a>
        <a
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Youtube className="h-4 w-4" />
          </Button>
        </a>
      </div>
      <div className="text-[10px] text-muted-foreground/70 max-w-md text-center">
        This tool is not affiliated with, endorsed by, or associated with Roblox Corporation. All
        Roblox trademarks, service marks, trade names, and logos are the property of Roblox
        Corporation.
      </div>
    </div>
  );
}
