import { Box, Chip } from "@mui/material";
import { keyframes } from "@emotion/react";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Typography from "./Typography";
import OfferCountdown from "./OfferCountdown";
import type { Offer } from "../types/offer";
import { ACCENT } from "../constants/globals";

const newBadgePulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0); }
`;

export default function OfferSummary({
  offer,
  isNew,
  color = ACCENT,
}: {
  offer: Offer;
  isNew: boolean;
  color?: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        height: "100%",
        minHeight: 300,
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        color: "#fff",
        bgcolor: color,
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          zIndex: 1,
          top: "50%",
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: "#fff",
          transform: "translateY(-50%)",
        },
        "&::before": { left: -12 },
        "&::after": { right: -12 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minWidth: 0,
          p: { xs: 2.5, sm: 3 },
          border: "2px dashed rgba(255,255,255,0.45)",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <LocalOfferOutlinedIcon
            aria-hidden="true"
            sx={{
              fontSize: 26,
              color: "rgba(255,255,255,0.8)",
              transition: "transform .25s ease",
              ".MuiCardActionArea-root:hover &": { transform: "scale(1.1)" },
            }}
          />
          {isNew && (
            <Chip
              label="NEW"
              size="small"
              sx={{
                height: 24,
                px: 0.25,
                color,
                bgcolor: "#fff",
                border: "1px solid rgba(255,255,255,0.8)",
                fontWeight: 800,
                animation: `${newBadgePulse} 2.4s ease-in-out infinite`,
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                },
              }}
            />
          )}
        </Box>
        <Typography
          component="h2"
          fontSize={28}
          fontWeight={900}
          lineHeight={1.05}
          letterSpacing={-0.6}
          color="inherit"
        >
          {offer.title}
        </Typography>
        <Typography
          fontSize={14}
          fontWeight={500}
          lineHeight={1.45}
          color="rgba(255,255,255,0.92)"
          mt={1.25}
          sx={{ flexGrow: 1 }}
        >
          {offer.description}
        </Typography>
        <Box
          sx={{
            mt: 3,
            pt: 1.75,
            borderTop: "1px dashed rgba(255,255,255,0.4)",
          }}
        >
          <OfferCountdown expiresAt={offer.expiresAt} />
        </Box>
      </Box>
    </Box>
  );
}
