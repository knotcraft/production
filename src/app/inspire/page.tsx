import { InspirationForm } from "@/components/inspire/inspiration-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InspirePage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="-ml-4">
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-xl font-bold">AI Theme Inspiration</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Tell us about your dream wedding, and our AI will generate personalized ideas to make your day unforgettable.
      </p>
      <InspirationForm />
    </div>
  );
}
