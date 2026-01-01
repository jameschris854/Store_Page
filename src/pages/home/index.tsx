import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import CollectionsGrid from "../../components/CollectionsGrid";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import ReviewsCarousel from "../../components/ReviewsCard/ReviewsCard";
import Section from "../../components/Section";
import ShopImagesCard from "../../components/ShopImagesCard";
import StoreTimingCard from "../../components/StoreTimingCard";
import { PRIMARY } from "../../constants/globals";
import usePlaceData from "../../hooks/usePlaceData";
import Container from "../../components/Container";
import Seo from "../../components/Seo";

/* ---------------- component ---------------- */
export default function Home() {
 const {loading,placeData} = usePlaceData()
 
  const siteName = "IJS Stationery";
  const pageTitle = placeData?.result?.name
    ? `${placeData.result.name} — ${siteName}`
    : `${siteName} — Stationery Store on ECR`;

  const pageDescription = placeData?.result?.formatted_address
    ? `Visit ${placeData.result.name} at ${placeData.result.formatted_address}. Premium stationery, school and office supplies on ECR.`
    : "Visit IJS Stationery on ECR for premium stationery, toys, gifts and office supplies.";
  return (
    <main
      style={{
        background: "linear-gradient(#fbfdff,#f7f9ff)",
      }}
    >
      <Seo title={pageTitle} description={pageDescription} />

      {/* ---------------- HERO ---------------- */}
      <Section>
        <Hero />
      </Section>
      {/* ---------------- COLLECTIONS ---------------- */}
      <Section loading={loading}>
        <CollectionsGrid />
      </Section>

      {/* ---------------- STORE PHOTOS ---------------- */}
      <Section>
        <Container>
          <Typography fontSize={28} sx={{ fontWeight: 900, color: PRIMARY }}>
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
        </Container>
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
          <Container mb={2}>
            <Typography
            fontSize={22}
            fontWeight={900}
            color={PRIMARY}
            mb={1}
            >
              Find Us
            </Typography>
            <Typography sx={{ color: "#475569", mb: 3 }}>
              Location, directions & store hours
            </Typography>

            <Grid container spacing={6}>
              {/* -------- LEFT : STORE HOURS -------- */}
              <Grid size={{ md: 5, sm: 12, xs: 12 }}>
                <StoreTimingCard
                  periods={placeData.result.current_opening_hours.periods}
                />
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
                    title="IJS Stationery Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src="https://maps.google.com/maps?hl=en&q=ijs stationery&z=19&output=embed"
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Section>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <Section >
        <Container my={6}>
          <Typography textAlign={"center"} sx={{ fontSize: 13, color: "#64748b" }}>
            © {new Date().getFullYear()} IJS Stationery — Designed to Inspire
            Writing
          </Typography>
        </Container>
      </Section>
      {placeData?.result && <Footer data={placeData?.result} />}
    </main>
  );
}
