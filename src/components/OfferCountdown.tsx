import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Typography from "./Typography";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function OfferCountdown({
  expiresAt,
}: {
  expiresAt: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  const expiry = expiresAt ? new Date(expiresAt) : null;
  const remaining = expiry ? Math.max(0, expiry.getTime() - now) : null;
  const days = remaining === null ? 0 : Math.floor(remaining / 86_400_000);
  const hours =
    remaining === null
      ? 0
      : Math.floor((remaining % 86_400_000) / 3_600_000);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return (
    <Box aria-live="off">
      <Typography
        fontSize={11}
        fontWeight={900}
        letterSpacing={1.1}
        textTransform="uppercase"
        color="rgba(255,255,255,0.92)"
      >
        {remaining === null
          ? "No expiry date"
          : remaining > 0
            ? `Ends in ${days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : `${hours} ${hours === 1 ? "hour" : "hours"}`}`
            : "Offer ended"}
      </Typography>
      {expiry && (
        <Typography fontSize={12} color="rgba(255,255,255,0.78)" mt={0.5}>
          Valid until {formatDate(expiry)}
        </Typography>
      )}
    </Box>
  );
}
