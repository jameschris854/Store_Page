import type { Review } from "../../types/googlePlaceDetailsRes";
import ShowcaseScroller from "../ShowcaseScroller";
import { Box, type SxProps, type Theme } from "@mui/material";
import Typography from "../Typography";

type ReviewsCarouselProps = {
  reviews: Review[];
  containerSx?: SxProps<Theme>;
  itemSx?: SxProps<Theme>;
  avatarSx?: SxProps<Theme>;
  headingSx?: SxProps<Theme>;
  captionSx?: SxProps<Theme>;
};

export default function ReviewsCarousel({
  reviews,
  containerSx,
  itemSx,
  avatarSx,
  headingSx,
  captionSx,
}: ReviewsCarouselProps) {
  const combine = (base: SxProps<Theme>, override?: SxProps<Theme>): SxProps<Theme> =>
    override ? ([base, override] as SxProps<Theme>) : base;
  return (
  <Box sx={combine({ alignItems: "center", display: "flex", flexDirection: "column" }, containerSx)}> 
      {/* Heading */}
  <Typography sx={combine({ fontSize: { xs: 18, md: 22 }, fontWeight: 500, mb: 0.5 }, headingSx)}>
        What customers say
      </Typography>

      {/* Caption */}
  <Typography sx={combine({ fontSize: 14, color: "#5f6368", mb: 3 }, captionSx)}> 
        Real testimonials from Google Maps
      </Typography>

      <ShowcaseScroller slidePadding={3}>
        {reviews.map((item, i) => (
          <Box
            key={i}
            sx={combine(
              {
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
              },
              itemSx
            )}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {/* Avatar */}
              <Box
                sx={combine(
                  {
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
                  },
                  avatarSx
                )}
              >
                {item.author_name?.charAt(0)}
              </Box>

              <Box>
                <Typography sx={combine({ fontSize: 15, fontWeight: 500 }, headingSx)}> 
                  {item.author_name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 0.25 }}>
                  <Typography sx={combine({ fontSize: 13, fontWeight: 500, mr: 0.5 }, captionSx)}> 
                    {item.rating}
                  </Typography>

                  <Typography sx={combine({ fontSize: 13, color: "#fbbc04", letterSpacing: "-1px", mr: 0.75 }, captionSx)}> 
                    {"★".repeat(Math.round(item.rating))}
                  </Typography>

                  <Typography sx={combine({ fontSize: 12, color: "#5f6368" }, captionSx)}> 
                    Google review
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Review text */}
            <Typography sx={combine(
              {
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
              },
              captionSx
            )}
            >
              “{item.text}”
            </Typography>

            {/* Footer */}
            <Typography sx={combine({ fontSize: 12, color: "#70757a" }, captionSx)}> 
              {new Date(item.time * 1000).toLocaleDateString()}
            </Typography>

            {/* Subtle Google watermark */}
            <Typography sx={combine({ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: "#9aa0a6", opacity: 0.5, pointerEvents: "none" }, captionSx)}>
              Google
            </Typography>
          </Box>
        ))}
      </ShowcaseScroller>

      {/* Bottom quote */}
  <Typography sx={combine({ mt: 3, fontSize: 14, color: "#5f6368", fontStyle: "italic" }, captionSx)}> 
        “Trusted by customers, reviewed on Google.”
      </Typography>
    </Box>
  );
}
