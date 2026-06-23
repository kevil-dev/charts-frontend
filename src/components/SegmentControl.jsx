import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function SegmentedControl() {
  return (
    <ToggleGroup 
      type="single" 
      defaultValue="apple"
      className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
    >
      <ToggleGroupItem 
        value="apple" 
        className="rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        Apple
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="spotify" 
        className="rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        Spotify
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="youtube" 
        className="rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        YouTube
      </ToggleGroupItem>
    </ToggleGroup>
  )
}