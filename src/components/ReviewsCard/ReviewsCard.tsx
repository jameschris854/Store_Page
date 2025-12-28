import type { Review } from "../../types/googlePlaceDetailsRes";
import ShowcaseScroller from "../ShowcaseScroller";
import { Box, Typography } from "@mui/material";

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  return (
    <Box sx={{alignItems: "center", display: "flex", flexDirection: "column" }}>
      {/* Heading */}
      <Typography
        sx={{
          fontSize: { xs: 18, md: 22 },
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        What customers say
      </Typography>

      {/* Caption */}
      <Typography
        sx={{
          fontSize: 14,
          color: "#5f6368",
          mb: 3,
        }}
      >
        Real testimonials from Google Maps
      </Typography>

      <ShowcaseScroller slidePadding={3}>
        {reviews.map((item, i) => (
          <Box
            key={i}
            sx={{
              width: 360,
              borderRadius: 3,
              backgroundColor: "#fff",
              p: 3,
              border: "1px solid #e6e6e6",
              fontFamily: `"Roboto", Arial, sans-serif`,
              position: "relative",
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              },
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {/* Avatar */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#1a73e8",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                }}
              >
                {item.author_name?.charAt(0)}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                  {item.author_name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 0.25 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mr: 0.5 }}>
                    {item.rating}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#fbbc04",
                      letterSpacing: "-1px",
                      mr: 0.75,
                    }}
                  >
                    {"★".repeat(Math.round(item.rating))}
                  </Typography>

                  <Typography sx={{ fontSize: 12, color: "#5f6368" }}>
                    Google review
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Review text */}
            <Typography
              sx={{
                fontSize: 15,
                color: "#3c4043",
                lineHeight: 1.6,
                fontStyle: "italic",
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                transition: "all 0.2s ease",
                "&:hover": {
                  WebkitLineClamp: "unset",
                },
              }}
            >
              “{item.text}”
            </Typography>

            {/* Footer */}
            <Typography sx={{ fontSize: 12, color: "#70757a" }}>
              {new Date(item.time * 1000).toLocaleDateString()}
            </Typography>

            {/* Subtle Google watermark */}
            <Typography
              sx={{
                position: "absolute",
                bottom: 12,
                right: 16,
                fontSize: 11,
                color: "#9aa0a6",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            >
              Google
            </Typography>
          </Box>
        ))}
      </ShowcaseScroller>

      {/* Bottom quote */}
      <Typography
        sx={{
          mt: 3,
          fontSize: 14,
          color: "#5f6368",
          fontStyle: "italic",
          
        }}
      >
        “Trusted by customers, reviewed on Google.”
      </Typography>
    </Box>
  );
}
