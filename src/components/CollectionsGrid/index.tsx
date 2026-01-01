import { Box, Button } from "@mui/material";
import type { Collection } from "../../types/type";
import Typography from "../Typography";
import { useEffect, useState } from "react";
import { ACCENT, PRIMARY } from "../../constants/globals";
import { useNavigate } from "react-router";
import { getCollectionsTree } from "../../services/collectionservice";
import CollectionCard from "../CollectionCard";
import Container from "../Container";

interface CollectionsGridProps {
}

export default function CollectionsGrid({
}: CollectionsGridProps) {
  const getCols = () =>    window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 2 : 3;
  const navigation = useNavigate();
  const [, setCols] = useState(getCols());
  const [collections, setVisible] = useState<Collection[]>([]);

    /* ---------------- responsive ---------------- */
  useEffect(() => {
    const onResize = () => setCols(getCols());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
   getCollectionsTree().then((data) => {
     setVisible(data);
   });
  },[])

  return (
    <Container>
      {/* ---------- SECTION TITLE ---------- */}
      <Box sx={{ mb: 3 }}>
        <Typography fontSize={12} letterSpacing={4} color={ACCENT} mb={0.5}>
          OUR RANGE
        </Typography>

        <Typography fontSize={28} fontWeight={900} color={PRIMARY}>
          Our Collections
        </Typography>
      </Box>

      {/* ---------- GRID ---------- */}
      <Box overflow={"clip"} flexDirection={"row"} gap={3} display={"flex"}>
        {collections.map((c) => (
          <Box width={150} height={150} display={"flex"}>
            <CollectionCard key={c.path} collection={c} />
          </Box>
        ))}
      </Box>
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Button
          aria-label="See More Collections"
          onClick={() => navigation("collections",{})}
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 999,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "none",
            color: ACCENT,
            border: `2px solid ${ACCENT}`,
            background: "transparent",
            transition: "all .3s ease",
            "&:hover": {
              background: ACCENT,
              color: "#fff",
              transform: "translateY(-2px)",
            },
          }}
        >
          See More
        </Button>
        </Box>
    </Container>
  );
}
