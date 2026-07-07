"use client";

import { useCallback, useEffect, useState } from "react";

export const RESEND_COOLDOWN_SECONDS = 60;

export function useResendCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const startCooldown = useCallback(() => {
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isCoolingDown: secondsLeft > 0,
    startCooldown,
  };
}
