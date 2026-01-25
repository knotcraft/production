import Image from 'next/image';
import { Bell } from 'lucide-react';
import { CountdownTimer } from '@/components/dashboard/countdown-timer';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Header() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'wedding-hero');
  const weddingDate = '2025-09-26T14:00:00';

  return (
    <div className="relative h-80 w-full overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Our Big Day</h1>
          <Button variant="ghost" size="icon" className="text-white bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 hover:text-white">
            <Bell />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
        <CountdownTimer targetDate={weddingDate} />
      </div>
    </div>
  );
}
