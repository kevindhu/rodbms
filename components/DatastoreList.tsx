import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DatastoreListProps {
  datastores: any[]
  selectedDatastore: string
  onSelectDatastore: (name: string) => void
}

export default function DatastoreList({ datastores, selectedDatastore, onSelectDatastore }: DatastoreListProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500">
        <CardTitle className="text-white">Datastores</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2">
            {datastores.map((ds) => (
              <Button
                key={ds.name}
                onClick={() => onSelectDatastore(ds.name)}
                variant={selectedDatastore === ds.name ? "secondary" : "outline"}
                className="w-full justify-start text-left"
              >
                {ds.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

