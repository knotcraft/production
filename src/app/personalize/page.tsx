'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { differenceInDays, format } from 'date-fns';
import { useUser, useFirebase } from '@/firebase';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function PersonalizePage() {
  const { user, loading: userLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const formattedDefaultDate = defaultDate.toISOString().split('T')[0];

  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState(formattedDefaultDate);
  const [daysLeft, setDaysLeft] = useState(365);
  
  useEffect(() => {
    if (user?.displayName) {
        setYourName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (weddingDate) {
      const target = new Date(weddingDate);
      const today = new Date();
      target.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      setDaysLeft(differenceInDays(target, today));
    }
  }, [weddingDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeddingDate(e.target.value);
  };
  
  const getFormattedDate = () => {
    if (!weddingDate) return '';
    const date = new Date(weddingDate);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    return format(adjustedDate, 'MMMM d, yyyy');
  };

  const handleFinishSetup = async () => {
    if (!user || !database) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to do that.",
        });
        return;
    }
    if (!yourName || !partnerName || !weddingDate) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields.",
        });
        return;
    }

    setIsLoading(true);

    try {
        const userRef = ref(database, 'users/' + user.uid);
        await set(userRef, {
            name: yourName,
            partnerName: partnerName,
            weddingDate: weddingDate,
        });

        toast({
            title: "Details Saved!",
            description: "Your wedding plan is ready.",
        });
        router.push('/');

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save your details.",
        });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto bg-white dark:bg-background-dark shadow-xl">
      {/* TopAppBar */}
      <div className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between">
        <Link href="/signup" className="text-[#181113] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </Link>
        <h2 className="text-[#181113] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Personalize Your Wedding
        </h2>
      </div>

      {/* Progress Indicator */}
      <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
        <div className="h-2 w-2 rounded-full bg-[#e6dbde] dark:bg-primary/20"></div>
        <div className="h-2 w-2 rounded-full bg-[#e6dbde] dark:bg-primary/20"></div>
        <div className="h-2 w-10 rounded-full bg-primary"></div>
      </div>

      {/* Headline Text */}
      <h2 className="text-[#181113] dark:text-white tracking-light text-[28px] font-bold leading-tight px-6 text-center pb-3 pt-5">
        Tell us about your big day
      </h2>

      {/* Body Text */}
      <p className="text-[#4a343a] dark:text-white/70 text-base font-normal leading-normal pb-6 pt-1 px-8 text-center">
        Let’s get the countdown started! Enter your details to customize your planning experience.
      </p>

      {/* Form Fields */}
      <div className="flex flex-col gap-2 px-6 overflow-y-auto flex-1">
        {/* Your Name */}
        <div className="flex flex-col w-full py-3">
          <label className="flex flex-col w-full">
            <p className="text-[#181113] dark:text-white text-sm font-semibold leading-normal pb-2">Your Name</p>
            <input 
                className="form-input flex w-full rounded-lg text-[#181113] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6dbde] dark:border-white/10 bg-white dark:bg-white/5 h-14 placeholder:text-[#89616b] p-[15px] text-base font-normal" 
                placeholder="Jane Doe"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
            />
          </label>
        </div>

        {/* Partner's Name */}
        <div className="flex flex-col w-full py-3">
          <label className="flex flex-col w-full">
            <p className="text-[#181113] dark:text-white text-sm font-semibold leading-normal pb-2">Partner's Name</p>
            <input 
                className="form-input flex w-full rounded-lg text-[#181113] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6dbde] dark:border-white/10 bg-white dark:bg-white/5 h-14 placeholder:text-[#89616b] p-[15px] text-base font-normal" 
                placeholder="Alex Smith"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
            />
          </label>
        </div>

        {/* Wedding Date */}
        <div className="flex flex-col w-full py-3">
          <label className="flex flex-col w-full">
            <p className="text-[#181113] dark:text-white text-sm font-semibold leading-normal pb-2">Planned Wedding Date</p>
            <div className="relative">
              <input 
                className="form-input flex w-full rounded-lg text-[#181113] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6dbde] dark:border-white/10 bg-white dark:bg-white/5 h-14 placeholder:text-[#89616b] p-[15px] text-base font-normal" 
                type="date" 
                value={weddingDate}
                onChange={handleDateChange}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
            </div>
          </label>
        </div>

        {/* Preview Card */}
        <div className="mt-4 p-6 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 flex flex-col items-center justify-center gap-2">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Countdown Preview</p>
          <div className="flex gap-4 items-baseline">
            <span className="text-4xl font-bold text-[#181113] dark:text-white">{daysLeft >= 0 ? daysLeft : 0}</span>
            <span className="text-lg font-medium text-[#4a343a] dark:text-white/60">days to go</span>
          </div>
          <p className="text-sm italic text-[#89616b] dark:text-white/50">{getFormattedDate()}</p>
        </div>
      </div>

      {/* Footer / Action Button */}
      <div className="p-6 pb-10 bg-white dark:bg-background-dark">
          <button 
            onClick={handleFinishSetup}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <span>Finish Setup</span>
            <span className="material-symbols-outlined text-sm">check_circle</span>
          </button>
        {/* Safe area indicator spacer (iOS) */}
        <div className="h-2 w-32 bg-gray-200 dark:bg-white/10 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Background Decorative Pattern */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5 overflow-hidden">
        <svg className="absolute -top-20 -right-20 w-96 h-96 text-primary fill-current" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.2,-69.2,70.1,-58.5,78.2,-45.3C86.3,-32.1,90.6,-16.1,89.5,-0.6C88.4,14.8,81.8,29.7,72.7,42.7C63.6,55.7,51.9,66.9,38.5,73.7C25.1,80.5,10,83, -4.8,91.3C-19.6,99.6,-34.1,113.8,-46.8,111.9C-59.5,110.1,-70.4,92.2,-79.1,76.4C-87.8,60.6,-94.3,46.9,-95.9,32.7C-97.5,18.5,-94.2,3.8,-90.4,-10.1C-86.5,-24.1,-82.1,-37.3,-73.9,-48.9C-65.7,-60.5,-53.8,-70.5,-40.8,-77.9C-27.8,-85.3,-13.9,-90.1,0.5,-90.9C14.9,-91.7,29.8,-88.4,44.7,-76.4Z" transform="translate(100 100)"></path>
        </svg>
      </div>
    </div>
  );
}
