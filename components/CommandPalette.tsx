// "use client";

// import { useState, useEffect } from "react";
// import { Command } from "cmdk";
// import { Dialog } from "@/components/ui/dialog";
// import { 
//   Search, Save, RefreshCw, Database, Key, 
//   Settings, HelpCircle, LogOut, Plus 
// } from "lucide-react";
// import { useDatastore } from "@/contexts/DatastoreContext";
// import { useToast } from "@/components/ui/toast";

// export function CommandPalette() {
//   const [open, setOpen] = useState(false);
//   const { 
//     datastores, 
//     selectedDatastore, 
//     setSelectedDatastore,
//     fetchDatastores,
//     clearCredentials
//   } = useDatastore();
//   const { toast } = useToast();

//   // Register keyboard shortcut
//   useEffect(() => {
//     const down = (e: KeyboardEvent) => {
//       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
//         e.preventDefault();
//         setOpen((open) => !open);
//       }
//     };

//     document.addEventListener("keydown", down);
//     return () => document.removeEventListener("keydown", down);
//   }, []);

//   const runCommand = (command: string) => {
//     switch (command) {
//       case "refresh-datastores":
//         fetchDatastores();
//         toast("Refreshed", "success");
//         break;
//       case "disconnect":
//         clearCredentials();
//         toast("Disconnected", "error");
//         break;
//       case "help":
//         window.open("https://github.com/yourusername/roblox-dbms", "_blank");
//         break;
//       default:
//         if (command.startsWith("select-datastore:")) {
//           const datastoreName = command.replace("select-datastore:", "");
//           setSelectedDatastore(datastoreName);
//           toast("Datastore Selected", "success");
//         }
//     }
//     setOpen(false);
//   };

//   return (
//     <>
//       <button
//         className="fixed right-4 top-4 flex items-center gap-1 text-sm text-muted-foreground px-2 py-1 rounded border bg-background/80 backdrop-blur-sm"
//         onClick={() => setOpen(true)}
//       >
//         <Search className="h-3.5 w-3.5" />
//         <span>Search...</span>
//         <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
//           <span className="text-xs">⌘</span>K
//         </kbd>
//       </button>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        
//         <Command
//           className="fixed top-1/4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border bg-popover shadow-md"
//           loop
//         >
//           <div className="flex items-center border-b px-3">
//             <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
//             <Command.Input 
//               placeholder="Type a command or search..." 
//               className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
//             />
//           </div>
          
//           <Command.List className="max-h-[300px] overflow-y-auto p-2">
//             <Command.Empty>No results found.</Command.Empty>
            
//             <Command.Group heading="Actions">
//               <Command.Item 
//                 onSelect={() => runCommand("refresh-datastores")}
//                 className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 Refresh Datastores
//               </Command.Item>
              
//               <Command.Item 
//                 onSelect={() => runCommand("create-datastore")}
//                 className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create New Datastore
//               </Command.Item>
              
//               <Command.Item 
//                 onSelect={() => runCommand("disconnect")}
//                 className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Disconnect
//               </Command.Item>
//             </Command.Group>
            
//             {datastores.length > 0 && (
//               <Command.Group heading="Datastores">
//                 {datastores.map((datastore) => (
//                   <Command.Item
//                     key={datastore}
//                     onSelect={() => runCommand(`select-datastore:${datastore}`)}
//                     className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//                   >
//                     <Database className="h-4 w-4" />
//                     {datastore}
//                     {datastore === selectedDatastore && (
//                       <span className="ml-auto text-xs text-muted-foreground">
//                         Selected
//                       </span>
//                     )}
//                   </Command.Item>
//                 ))}
//               </Command.Group>
//             )}
            
//             <Command.Group heading="Help">
//               <Command.Item 
//                 onSelect={() => runCommand("help")}
//                 className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//               >
//                 <HelpCircle className="h-4 w-4" />
//                 Documentation
//               </Command.Item>
              
//               <Command.Item 
//                 onSelect={() => runCommand("keyboard-shortcuts")}
//                 className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
//               >
//                 <Key className="h-4 w-4" />
//                 Keyboard Shortcuts
//               </Command.Item>
//             </Command.Group>
//           </Command.List>
//         </Command>
//       </Dialog>
//     </>
//   );
// } 