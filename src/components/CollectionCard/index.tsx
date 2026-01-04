import { Grid, Card, CardMedia, Box } from "@mui/material";
import { useNavigate } from "react-router";
import type { Collection } from "../../types/type";
import Typography from "../Typography";
import { buildPexelsImage } from "../../utils/image";

export default function CollectionCard({
  collection,
}: {
  collection: Collection;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/collections/${collection.path}`);
  };

  const img = buildPexelsImage(collection.img || "");

  return (
    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} sx={{ display: "flex" }}>
      <Card
        role="link"
        tabIndex={0}
        aria-label={`Open ${collection.name}`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 4,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
          transition: "transform .35s ease, box-shadow .35s ease",

          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 22px 48px rgba(2,6,23,0.14)",
          },

          "&:focus-visible": {
            outline: "3px solid rgba(99,102,241,.6)",
            outlineOffset: 2,
          },
        }}
      >
        {/* Image */}
        <CardMedia
          component="img"
          src={img.base}
          srcSet={`
            ${img.small} 300w,
            ${img.medium} 600w,
            ${img.large} 900w
          `}
          sizes="(max-width: 600px) 90vw, (max-width: 1200px) 33vw, 400px"
          alt="Art and stationery supplies collection at IJS Stationery store"
          loading="lazy"
          decoding="async"
          sx={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            transition: "transform .6s ease",
            ".MuiCard-root:hover &": {
              transform: "scale(1.05)"
            }
          }}
        />

        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(2,6,23,0.75), rgba(2,6,23,0.05) 65%)",
            transition: "opacity .35s ease",
          }}
        />

        {/* Title */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            p: "10%",
            transition: "transform .35s ease",
            ".MuiCard-root:hover &": {
              transform: "translateY(-6px)",
            },
          }}
        >
          <Typography
            responsive
            color="#fff"
            fontWeight={600}
            fontSize={20}
            lineHeight={1.2}
          >
            {collection.name}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
}
