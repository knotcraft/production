'use client';

import Image from 'next/image';
import { Bell, LogOut } from 'lucide-react';
import { CountdownTimer } from '@/components/dashboard/countdown-timer';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirebase } from '@/firebase';
import { ref, get } from 'firebase/database';
import { useEffect, useState } from 'react';

type UserData = {
    name: string;
    partnerName: string;
    weddingDate: string;
};

export function Header() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (user && database) {
      const fetchUserData = async () => {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val() as UserData);
        }
      };
      fetchUserData();
    }
  }, [user, database]);

  const heroImage = PlaceHolderImages.find(img => img.id === 'wedding-hero');

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {userData ? `${userData.name} & ${userData.partnerName}` : 'Our Big Day'}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 hover:text-white">
              <Bell />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-white bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 hover:text-white">
              <LogOut />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
        {userData?.weddingDate && <CountdownTimer targetDate={userData.weddingDate} />}
      </div>
    </div>
  );
}
