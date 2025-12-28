import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Icon,
  Skeleton,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicGoogleSheetsParser from "public-google-sheets-parser";

import { buildCategorySchema } from "./utils/categoryParser";
import type { googlePlaceDetailsRes } from "./types/googlePlaceDetailsRes";

import StoreTimingsCard from "./components/StoreTimingCard";
import ReviewsCarousel from "./components/ReviewsCard/ReviewsCard";
import ShopImagesCard from "./components/ShopImagesCard";
import Reveal from "./components/Reveal";
import Footer from "./components/Footer";
import Section from "./components/Section";
import Cross from "./assets/Icons/Cross";
import CollectionsGrid from "./components/CollectionsGrid";
import type { Collection } from "./types/type";
import Hero from "./components/Hero";

/* ---------------- theme ---------------- */
export const PRIMARY = "#0b4dba";
export const ACCENT = "#dd5858ff";

/* ---------------- data sources ---------------- */
const collectionParser = new PublicGoogleSheetsParser(
  import.meta.env.VITE_SHEET_ID,
  { sheetName: "COLLECTIONS" }
);

const mastersParser = new PublicGoogleSheetsParser(
  import.meta.env.VITE_SHEET_ID,
  { sheetName: "COLLECTION MASTER" }
);

const STORE = {
  phone: "9941715234",
  whatsapp: "919941715234",
  email: "ijsstationeryecr@gmail.com",
};

/* ---------------- component ---------------- */
export default function LandingCollections() {
  const getCols = () =>
    window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 2 : 3;

  const [cols, setCols] = useState(getCols());
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [visible, setVisible] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [placeData, setPlaceData] = useState<googlePlaceDetailsRes | null>(
    null
  );

  /* ---------------- fetch data ---------------- */
  useEffect(() => {
    Promise.all([collectionParser.parse(), mastersParser.parse()]).then(
      ([collectionData, masterData]) => {
        const masterMap: Record<string, any> = {};
        masterData.forEach((row: any) => {
          masterMap[row.cat_name] = row;
        });

        const nested = buildCategorySchema(collectionData);
        nested.forEach((c) => {
          if (masterMap[c.name]) c.img = masterMap[c.name].img;
        });

        setCategories(nested);
        setVisible(nested.slice(0, cols * 2));
      }
    );

    fetch("/api/place-details")
      .then((r) => r.json())
      .then((json) => {
        setPlaceData(json);
        setLoading(false);
      });
  }, []);

  /* ---------------- responsive ---------------- */
  useEffect(() => {
    const onResize = () => setCols(getCols());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const maxVisible = cols * 2;
    setVisible(showAll ? categories : categories.slice(0, maxVisible));
  }, [cols, showAll, categories]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(#fbfdff,#f7f9ff)",
      }}
    >
      {/* ---------------- HERO ---------------- */}
      <Section>
        <Hero />
      </Section>
      {/* ---------------- COLLECTIONS ---------------- */}
      <Section loading={loading}>
        <CollectionsGrid
          collections={visible}
          onSelect={(c) => {
            // navigate(`/collections/${slugify(c.name)}`)
            console.log("Selected:", c.name);
          }}
        />
      </Section>

      {/* ---------------- STORE PHOTOS ---------------- */}
      <Section>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: PRIMARY }}>
          Store Photos
        </Typography>

        <Box
          sx={{
            mt: 3,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(2,6,23,0.08)",
          }}
        >
          <ShopImagesCard />
        </Box>
      </Section>

      {/* ---------------- REVIEWS ---------------- */}
      {placeData?.result?.reviews && (
        <Section loading={loading}>
          <ReviewsCarousel reviews={placeData.result.reviews} />
        </Section>
      )}

      {/* ---------------- FIND US ---------------- */}
      {placeData?.result?.current_opening_hours?.periods && (
        <Section loading={loading}>
          <Typography
            sx={{ fontSize: 22, fontWeight: 900, color: PRIMARY, mb: 1 }}
          >
            Find Us
          </Typography>
          <Typography sx={{ color: "#475569", mb: 3 }}>
            Location, directions & store hours
          </Typography>

          <Grid container spacing={6}>
            {/* -------- LEFT : STORE HOURS -------- */}
            <Grid size={{ md: 5, sm: 12, xs: 12 }}>
              <StoreTimingsCard
                periods={placeData.result.current_opening_hours.periods}
              />

              {/* Contact row */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <PhoneIcon sx={{ color: PRIMARY }} />
                <Typography sx={{ fontWeight: 800 }}>{STORE.phone}</Typography>

                <Button
                  size="small"
                  startIcon={<WhatsAppIcon />}
                  href={`https://wa.me/${STORE.whatsapp}`}
                  target="_blank"
                  sx={{ fontWeight: 800 }}
                >
                  WhatsApp
                </Button>
              </Box>
            </Grid>

            {/* -------- RIGHT : MAP -------- */}
            <Grid size={{ md: 7, sm: 12, xs: 12 }}>
              <Box
                sx={{
                  height: { xs: 260, md: "100%" },
                  minHeight: 360,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 14px 40px rgba(2,6,23,0.08)",
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src="https://maps.google.com/maps?hl=en&q=ijs stationery&z=19&output=embed"
                />
              </Box>
            </Grid>
          </Grid>
        </Section>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <Section >
        <Box>
          <Typography sx={{ fontSize: 13, color: "#64748b" }}>
            © {new Date().getFullYear()} IJS Stationery — Designed to Inspire
            Writing
          </Typography>
        </Box>
      </Section>
      {placeData?.result && <Footer data={placeData?.result} />}
    </Box>
  );
}
