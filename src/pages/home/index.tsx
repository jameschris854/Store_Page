import CollectionsGrid from "../../components/CollectionsGrid";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import ReviewsCarousel from "../../components/ReviewsCard/ReviewsCard";
import Section from "../../components/Section";
import usePlaceData from "../../hooks/usePlaceData";
import Seo from "../../components/Seo";
import StorePhotos from "../../components/StorePhotos";
import FindUs from "../../components/FindUs";

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
    <main>
      <Seo title={pageTitle} description={pageDescription} />

      {/* ---------------- HERO ---------------- */}
      <Section>
        <Hero />
      </Section>
      {/* ---------------- COLLECTIONS ---------------- */}
      <CollectionsGrid />

      {/* ---------------- STORE PHOTOS ---------------- */}
      <Section>
        <StorePhotos />
      </Section>

      {/* ---------------- REVIEWS ---------------- */}
      <Section loading={loading}>
        {placeData?.result?.reviews && (<ReviewsCarousel reviews={placeData.result.reviews} />)}
      </Section>

      {/* ---------------- FIND US ---------------- */}
      
      <Section loading={loading}>
        {placeData?.result?.current_opening_hours?.periods && (<FindUs placeData={placeData} /> )}
      </Section>

      {/* ---------------- FOOTER ---------------- */}
      {placeData?.result && <Footer data={placeData?.result} />}
    </main>
  );
}
