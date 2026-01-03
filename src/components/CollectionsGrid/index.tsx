import { Box, Button } from "@mui/material";
import type { Collection } from "../../types/type";
import { useEffect, useState } from "react";
import { ACCENT } from "../../constants/globals";
import { useNavigate } from "react-router";
import { getCollectionsTree } from "../../services/collectionservice";
import CollectionCard from "../CollectionCard";
import Container from "../Container";
import Title from "../Section/Title";
import Section from "../Section";

export default function CollectionsGrid() {
  const getCols = () =>
    window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 2 : 3;
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
  }, []);

  return (
    <Section loading={Boolean(!collections.length)}>
      <Container>
        {/* ---------- SECTION TITLE ---------- */}
        <Title title={"Our Collections"} topLabel={"OUR RANGE"} />

        {/* ---------- GRID ---------- */}
        <Box overflow={"clip"} flexDirection={"row"} gap={3} display={"flex"}>
          {collections.map((c) => (
            <Box key={`hc_${c.name}`} width={150} height={150} display={"flex"}>
              <CollectionCard key={c.path} collection={c} />
            </Box>
          ))}
        </Box>
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            aria-label="See More Collections"
            onClick={() => navigation("collections", {})}
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
    </Section>
  );
}
