import { ThemeInspirationOutput } from "@/ai/flows/ai-theme-inspiration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PartyPopper, MapPin, Music } from "lucide-react";

type InspirationResultsProps = {
  results: ThemeInspirationOutput;
};

export function InspirationResults({ results }: InspirationResultsProps) {
  if (!results || results.ideas.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold text-center">Your Wedding Inspiration</h2>
      {results.ideas.map((idea, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-4">
              <PartyPopper className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Decoration Ideas</h4>
                <p className="text-sm text-muted-foreground">{idea.decorationIdeas}</p>
              </div>
            </div>
            <Separator />
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Venue Ideas</h4>
                <p className="text-sm text-muted-foreground">{idea.venueIdeas}</p>
              </div>
            </div>
            <Separator />
            <div className="flex gap-4">
              <Music className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Music & Entertainment</h4>
                <p className="text-sm text-muted-foreground">{idea.musicIdeas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
