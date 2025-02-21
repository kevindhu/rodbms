import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DatastoreListProps } from '@/types/api'

export default function DatastoreList({ datastores, onSelect, selected }: DatastoreListProps) {
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
                key={ds}
                onClick={() => onSelect(ds)}
                variant={selected === ds ? "secondary" : "outline"}
                className="w-full justify-start text-left"
              >
                {ds}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

