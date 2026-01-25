"use client";

import { useState, useEffect } from 'react';

type CountdownProps = {
  targetDate: string;
};

const calculateTimeLeft = (target: Date) => {
  const difference = +target - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

export function CountdownTimer({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate);
    setTimeLeft(calculateTimeLeft(target));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="mb-2 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/80">
        Countdown to Forever
      </p>
      <div className="flex gap-3">
        <div className="flex grow basis-0 flex-col items-center">
          <p className="text-2xl font-bold text-white">{timeLeft.days}</p>
          <p className="text-[10px] font-medium uppercase text-white/70">Days</p>
        </div>
        <div className="flex grow basis-0 flex-col items-center border-l border-white/20">
          <p className="text-2xl font-bold text-white">{formatNumber(timeLeft.hours)}</p>
          <p className="text-[10px] font-medium uppercase text-white/70">Hours</p>
        </div>
        <div className="flex grow basis-0 flex-col items-center border-l border-white/20">
          <p className="text-2xl font-bold text-white">{formatNumber(timeLeft.minutes)}</p>
          <p className="text-[10px] font-medium uppercase text-white/70">Mins</p>
        </div>
        <div className="flex grow basis-0 flex-col items-center border-l border-white/20">
          <p className="text-2xl font-bold text-white">{formatNumber(timeLeft.seconds)}</p>
          <p className="text-[10px] font-medium uppercase text-white/70">Secs</p>
        </div>
      </div>
    </div>
  );
}
