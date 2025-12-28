import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Box,
  Stack,
  Button,
  Divider,
  Rating,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { ACCENT } from "../../App";
import type { Result } from "../../types/googlePlaceDetailsRes";
import Typography from "../Typography";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

type Period = {
  open: { day: number; time: string };
  close: { day: number; time: string };
};

type Props = {
  data: Result
};

const parse = (t: string) => dayjs(t, "HHmm");

function isOpenNow(periods: Period[]) {
  const now = dayjs();
  const today = now.day();

  return periods.some((p) => {
    if (p.open.day !== today) return false;
    const start = parse(p.open.time);
    const end = parse(p.close.time);
    return now.isBetween(start, end, null, "[)");
  });
}

export default function Footer({data}: Props) {

 let periods = data?.current_opening_hours?.periods || [];
 const name = data?.name || "Store Name";
 const rating = data?.rating || 0;
 const address = data?.formatted_address || "Store Address";
 const phone = data?.formatted_phone_number || "0000000000";
 const url = data?.url || "#";

  const openNow = isOpenNow(periods);

  return (
    <Box
      sx={{
        mt: 10,
        px: 2,
        py: 4,
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <Box maxWidth="lg" mx="auto">
        {/* ---------- TOP ---------- */}
        <Stack spacing={1}>
          <Typography fontSize={20} fontWeight={900}>
            {name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography fontSize={14} color="#cbd5f5">
              {rating} on Google
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon fontSize="small" />
            <Typography fontSize={14} color="#cbd5f5">
              {address}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mt={1}
          >
            <Button
              startIcon={<PhoneIcon />}
              href={`tel:${phone}`}
              sx={{ color: "#fff", justifyContent: "flex-start" }}
            >
              {phone}
            </Button>

            <Button
              startIcon={<WhatsAppIcon />}
              href={`https://wa.me/91${phone}`}
              target="_blank"
              sx={{ color: "#22c55e", justifyContent: "flex-start" }}
            >
              WhatsApp
            </Button>

            <Button
              startIcon={<LocationOnIcon />}
              href={url}
              target="_blank"
              sx={{ color: ACCENT, justifyContent: "flex-start" }}
            >
              Directions
            </Button>
          </Stack>

          <Typography
            fontSize={14}
            fontWeight={700}
            color={openNow ? "#22c55e" : "#f87171"}
            mt={1}
          >
            {openNow ? "Open now" : "Closed now"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3, borderColor: "#334155" }} />

        {/* ---------- BOTTOM ---------- */}
        <Typography fontSize={13} color="#94a3b8">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
