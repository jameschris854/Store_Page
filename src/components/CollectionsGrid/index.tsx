import {
  Grid,
  Card,
  CardMedia,
  Box,
  Typography,
} from "@mui/material";
import type { Collection } from "../../types/type";
import { ACCENT, PRIMARY } from "../../App";

interface CollectionsGridProps {
  collections: Collection[];
  onSelect?: (collection: Collection) => void;
}

export default function CollectionsGrid({
  collections,
  onSelect,
}: CollectionsGridProps) {
  return (
    <Box>
      {/* ---------- SECTION TITLE ---------- */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 4,
            color: ACCENT,
            mb: 0.5,
          }}
        >
          OUR RANGE
        </Typography>

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 900,
            color: PRIMARY,
          }}
        >
          Our Collections
        </Typography>
      </Box>

      {/* ---------- GRID ---------- */}
      <Grid container spacing={3}>
        {collections.map((c) => (
          <Grid
            size={{ md: 4,sm: 6, xs: 12 ,lg:3 ,xl:3}}   

            key={c.name}
            sx={{ display: "flex" }}
          >
            <Card
              onClick={() => onSelect?.(c)}
              sx={{
                position: "relative",
                width: "100%",
                height: 260, // 🔒 fixed height = uniform
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all .35s ease",
                boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 45px rgba(2,6,23,0.12)",
                },
              }}
            >
              {/* Image */}
              <CardMedia
                component="img"
                image={c.img}
                alt={c.name}
                sx={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(2,6,23,0.75), rgba(2,6,23,0.1) 65%)",
                }}
              />

              {/* Text */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  p: 2.5,
                }}
              >
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 20,
                    lineHeight: 1.2,
                  }}
                >
                  {c.name}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Explore →
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
