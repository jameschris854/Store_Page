import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Box,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import Typography from "./Typography";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

type Period = {
  open: { day: number; time: string };
  close: { day: number; time: string };
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const parse = (t: string) => dayjs(t, "HHmm");

function groupByDay(periods: Period[]) {
  const map: Record<number, Period[]> = {};
  periods.forEach(p => {
    if (!map[p.open.day]) map[p.open.day] = [];
    map[p.open.day].push(p);
  });
  return map;
}

function format(periods: Period[]) {
  if (!periods.length) return ["Closed"];

  return periods.map(
    p =>
      `${parse(p.open.time).format("h:mm A")} – ${parse(p.close.time).format(
        "h:mm A"
      )}`
  );
}

function getStatus(periods: Period[]) {
  const now = dayjs();

  for (const p of periods) {
    const start = parse(p.open.time);
    const end = parse(p.close.time);

    if (now.isBetween(start, end, null, "[)")) {
      return {
        label: `Open now · Closes ${end.format("h:mm A")}`,
        color: "#16a34a",
      };
    }
  }

  return { label: "Closed now", color: "#dc2626" };
}

export default function StoreHoursMinimal({ periods }: { periods: Period[] }) {
  const grouped = groupByDay(periods);
  const today = new Date().getDay();
  const todayPeriods = grouped[today] ?? [];
  const status = getStatus(todayPeriods);

  return (
    <Box
      sx={{
        borderRadius: 3,
        background: "#fff",
        boxShadow: "0 8px 28px rgba(2,6,23,0.06)",
      }}
    >
      <Typography fontWeight={900} fontSize={20}>
        Store hours
      </Typography>

      <Chip
        label={status.label}
        size="small"
        sx={{
          mt: 1,
          mb: 2,
          fontWeight: 800,
          bgcolor: `${status.color}22`,
          color: status.color,
        }}
      />

      <Typography fontSize={14} fontWeight={700} mb={0.5}>
        Today
      </Typography>

      <Stack spacing={0.5} mb={2}>
        {format(todayPeriods).map((t, i) => (
          <Typography key={i} fontSize={14} color="text.secondary">
            {t}
          </Typography>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        {DAYS.map((day, i) => {
          if (i === today) return null;
          return (
            <Stack
              key={day}
              direction="row"
              justifyContent="space-between"
            >
              <Typography fontSize={14}>{day}</Typography>
              <Typography fontSize={14} color="text.secondary">
                {format(grouped[i] ?? []).join(", ")}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
