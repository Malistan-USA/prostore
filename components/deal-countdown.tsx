
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";

const TARGET_DATE = new Date("2026-12-20T00:00:00");

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTimeRemaining = (
  targetDate: Date
): TimeRemaining => {
  const currentTime = Date.now();
  const timeDifference = Math.max(
    targetDate.getTime() - currentTime,
    0
  );

  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
    ),
    minutes: Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    ),
    seconds: Math.floor(
      (timeDifference % (1000 * 60)) / 1000
    ),
  };
};

const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <li className="w-full p-4 text-center">
    <p className="text-3xl font-bold">{value}</p>
    <p>{label}</p>
  </li>
);

function DealCountDown() {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      setTime(calculateTimeRemaining(TARGET_DATE));
    };

    updateCountdown();

    const timerInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const isEnded =
    time !== null &&
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0;

  return (
    <section className="my-20 grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col justify-center gap-2">
        <h3 className="text-3xl font-bold">
          Deal Of The Month
        </h3>

        {time === null ? (
          <p>Loading countdown...</p>
        ) : isEnded ? (
          <p>This deal has ended.</p>
        ) : (
          <>
            <p>
              This template is expertly designed to maximize
              urgency and encourage quick action.
            </p>

            <ul className="grid grid-cols-4">
              <StatBox label="Days" value={time.days} />
              <StatBox label="Hours" value={time.hours} />
              <StatBox label="Minutes" value={time.minutes} />
              <StatBox label="Seconds" value={time.seconds} />
            </ul>
          </>
        )}

        <div className="text-center">
          <Button asChild>
            <Link href="/search">View Products</Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Image
          src="/images/promo.jpg"
          alt="Promotion"
          width={300}
          height={200}
        />
      </div>
    </section>
  );
}

export default DealCountDown;
