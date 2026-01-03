import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Stack,
  Button,
  Divider,
  Rating,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import type { Result } from "../../types/googlePlaceDetailsRes";
import Typography from "../Typography";
import { PRIMARY } from "../../constants/globals";
import Container from "../Container";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

type Props = {
  data: Result
};

export default function Footer({data}: Props) {

 const name = data?.name || "";
 const rating = data?.rating || 0;
 const address = data?.formatted_address || "";
 const phone = data?.formatted_phone_number || "";
 const url = data?.url || "#";

  return (
    <Container
      sx={{
        mt: 10,
        py: 4,
        background: "#ffffffff",
        color: "#1a1a1aff",
        marginTop: "auto"
      }}
    >
        {/* ---------- TOP ---------- */}
        <Stack spacing={1}>
          <Typography letterSpacing={1.2} fontSize={20} fontWeight={900} color={PRIMARY}>
            {name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography fontSize={14}>
              {rating} on Google
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon fontSize="small" />
            <Typography fontSize={14} >
              {address}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mt={1}
          >
            <Button
              aria-label="call now"
              startIcon={<PhoneIcon />}
              href={`tel:${phone}`}
              sx={{ color: "#b91c1c", justifyContent: "flex-start" }}
            >
              {phone}
            </Button>

            <Button
              aria-label="chat on whatsapp"
              startIcon={<WhatsAppIcon />}
              href={`https://wa.me/91${phone}`}
              target="_blank"
              sx={{ color: "#b91c1c",background:"transparent", justifyContent: "flex-start" }}
            >
              WhatsApp
            </Button>

            <Button
              aria-label="get directions in google maps"
              startIcon={<LocationOnIcon />}
              href={url}
              target="_blank"
              sx={{ color: "#b91c1c", justifyContent: "flex-start" }}
            >
              Directions
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: "#a8b8cfff" }} />

        {/* ---------- BOTTOM ---------- */}
        <Typography fontSize={13} color="#222a35ff">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </Typography>
    </Container>
  );
}
