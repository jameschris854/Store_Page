import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Divider,
  Chip,
  Icon,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicGoogleSheetsParser from "public-google-sheets-parser";
import { buildCategorySchema } from "./utils/categoryParser";
import type { Category } from "./types/type";
import SwiperCarousel from "./components/Swipable";

/**
 * LandingCollections.tsx
 *
 * Single-file landing page focused on Collections (catalog only).
 * - Compact grid format
 * - "Product catalog coming soon" banner
 * - Google Maps Place embed (iframe using PLACE_ID)
 * - Reviews area that expects a server endpoint to fetch Google Places reviews
 *
 * Replace placeholders:
 * - logoSrc: your uploaded logo path
 * - collectionsData: replace with your Google Sheets parser or API
 * - PLACE_ID: your Google Business Place ID
 * - /api/google-reviews: server endpoint that calls Google Places Details (recommended)
 */

/* ---------------- theme colors (from your logo) ---------------- */
const PRIMARY = "#0b4dba";
const ACCENT = "#b91c1c";

/* ---------------- placeholders (replace with real assets) ---------------- */

/* ---------------- collections (dummy) - keep compact and grid-friendly ---------------- */
const collectionParser = new PublicGoogleSheetsParser(
  import.meta.env.VITE_SHEET_ID,
  { sheetName: "COLLECTIONS" }
);

const mastersParser = new PublicGoogleSheetsParser(
  import.meta.env.VITE_SHEET_ID,
  { sheetName: "COLLECTION MASTER" }
);
/* ---------------- store config ---------------- */
const STORE = {
  phone: "9941715234",
  whatsapp: "919941715234", // international format for wa.me links
  email: "ijsstationeryecr@gmail.com",
  hours: [
    { day: "Mon", hours: "9:30 AM – 8:00 PM" },
    { day: "Tue", hours: "9:30 AM – 8:00 PM" },
    { day: "Wed", hours: "9:30 AM – 8:00 PM" },
    { day: "Thu", hours: "9:30 AM – 8:00 PM" },
    { day: "Fri", hours: "9:30 AM – 8:00 PM" },
    { day: "Sat", hours: "9:30 AM – 8:00 PM" },
    { day: "Sun", hours: "10:00 AM – 6:00 PM" },
  ],
};

/* ---------------- Google Maps / Reviews placeholders ---------------- */
const PLACE_ID = import.meta.env.VITE_PLACE_ID;
console.log("PLACE_ID:", PLACE_ID);
/* ---------------- main component ---------------- */
export default function LandingCollections() {
  const getCols = () =>
    window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 2 : 3;

  const [showAll, setShowAll] = useState(false);
  const [cols, setCols] = useState<number>(getCols());
  const [categories, setCategories] = useState<Category[]>([]);
  const [visible, setVisible] = useState([] as Category[]);

  useEffect(() => {
    Promise.all([collectionParser.parse(), mastersParser.parse()]).then(
      ([collectionData, masterData]) => {
        const masterMap: Record<string, any> = {};
        masterData.forEach((row: any) => {
          masterMap[row.cat_name] = row;
        });

        const nested = buildCategorySchema(collectionData);

        nested.forEach((c) => {
          if (masterMap[c.name]) {
            c.img = masterMap[c.name].img;
          }
        });

        setCategories(nested);
        setVisible(nested.slice(0, cols * 2));
      }
    );
  }, []);

  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => setCols(getCols());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const maxVisible = cols * 2;
    setVisible(showAll ? categories : categories.slice(0, maxVisible));
  }, [cols, showAll]);

  /* simple entrance animation using CSS transitions (keeps bundle small) */
  useEffect(() => {
    if (!gridRef.current) return;
    const children = Array.from(gridRef.current.children) as HTMLElement[];
    children.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px) scale(0.99)";
      el.style.transition =
        "opacity .45s ease, transform .45s cubic-bezier(.2,.8,.2,1)";
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0) scale(1)";
      }, 60 * i);
    });
  }, [visible.length]);

  /* fetch reviews from server endpoint (replace /api/google-reviews with your endpoint) */
const items = [ { name: "First Item", description: "Description for first item" }, { name: "Second Item", description: "Description for second item" } ];
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(#fbfdff,#f7f9ff)",
      }}
    >
      {/* HERO */}
      <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 }, px: 2 }}>
        <Icon>
          <LocationOnIcon sx={{ color: PRIMARY }} />
        </Icon>
        <Typography variant="h1" color={ACCENT} sx={{ fontWeight: 900 }}>
          IJS
        </Typography>
        <Typography variant="h1" color={PRIMARY} sx={{ fontWeight: 900 }}>
          STATIONERY
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: ACCENT,
            fontWeight: 900,
          }}
        >
          SCHOOL . TOYS . GIFTS . OFFICE . ART . SPORTS
        </Typography>
        <Typography variant="subtitle1">
          Your one-stop shop for all stationery needs.
        </Typography>
      </Box>

      <Container sx={{ pb: 8 }}>
        {/* Collections grid (compact) */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 4,
              color: ACCENT,
              fontWeight: 800,
            }}
          >
            OUR RANGE
          </Typography>
          <Typography
            sx={{ fontSize: 28, fontWeight: 900, color: PRIMARY, mb: 3 }}
          >
            Collections
          </Typography>

          <Grid container spacing={2} ref={gridRef as any}>
            {visible.map((c) => (
              <Grid size={12 / cols} key={c.name}>
                <Card
                  sx={{
                    height: 160,
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    alignItems: "stretch",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 18px 40px rgba(2,6,23,0.06)",
                    },
                    transition: "transform .25s ease, box-shadow .25s ease",
                  }}
                  onClick={() => {
                    // For now, just scroll to map/contact or open a modal later
                    const el = document.getElementById("find-us");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  role="button"
                  aria-label={`Explore ${c.name} collection`}
                >
                  <CardMedia
                    component="img"
                    image={c.img}
                    alt={c.name}
                    sx={{ width: 140, objectFit: "cover" }}
                    loading="lazy"
                  />
                  <Box
                    sx={{
                      p: 1.25,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: 15 }}>
                      {c.name}
                    </Typography>
                    <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                      {c.short}
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        color: PRIMARY,
                        fontWeight: 800,
                        p: 0,
                      }}
                      aria-label={`View ${c.name}`}
                    >
                      View collection →
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {categories.length > visible.length && (
            <Box textAlign="center" mt={3}>
              <Button
                onClick={() => setShowAll((s) => !s)}
                sx={{
                  borderRadius: 99,
                  px: 5,
                  py: 1.1,
                  fontWeight: 800,
                  border: `2px solid ${PRIMARY}`,
                  color: PRIMARY,
                  "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                }}
              >
                {showAll ? "Show Less" : "View All Collections"}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 4,
              color: ACCENT,
              fontWeight: 800,
            }}
          >
            OUR STORE
          </Typography>
          <Typography
            sx={{ fontSize: 28, fontWeight: 900, color: PRIMARY, mb: 3 }}
          >
            STORE PHOTOS
          </Typography>
          <SwiperCarousel />
        </Box>
        <Divider sx={{ my: 6 }} />

        {/* Reviews + Map */}
        <Container>
          <Box sx={{ p: 2 }}>
            <div
              className="sk-ww-google-reviews"
              data-embed-id="25636997"
            ></div>
          </Box>
        </Container>

        <Grid item xs={12} md={6}>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: PRIMARY }}>
            Find us
          </Typography>
          <Typography sx={{ color: "#475569", mb: 2 }}>
            Visit our store — directions and hours below
          </Typography>

          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
            }}
          >
            <div className="mapouter">
              <div className="gmap_canvas">
                <iframe
                  className="gmap_iframe"
                  width="100%"
                  height="320"
                  title="IJS Stationery location"
                  style={{ border: 0 }}
                  src="https://maps.google.com/maps?width=600&amp;height=559&amp;hl=en&amp;q=ijs stationery&amp;t=&amp;z=19&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                ></iframe>
              </div>
            </div>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <PhoneIcon sx={{ color: PRIMARY }} />
              <Typography sx={{ fontWeight: 800 }}>{STORE.phone}</Typography>
            </Box>

            <Button
              startIcon={<WhatsAppIcon />}
              href={`https://wa.me/${STORE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              sx={{ textTransform: "none" }}
            >
              Message on WhatsApp
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Store hours</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {STORE.hours.map((h) => (
                <Chip
                  key={h.day}
                  label={`${h.day}: ${h.hours}`}
                  sx={{ bgcolor: "#fff", borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Divider sx={{ my: 6 }} />

        {/* Coming soon banner */}
        <Box
          sx={{
            mt: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "#fff7f7",
            border: `1px solid ${ACCENT}`,
            px: 3,
            py: 1,
            borderRadius: 99,
            boxShadow: "0 6px 18px rgba(12,20,40,0.04)",
          }}
          role="status"
          aria-live="polite"
        >
          <Typography sx={{ color: ACCENT, fontWeight: 900 }}>
            Product catalog coming soon
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
            Visit the store to see full products
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Contact footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 900 }}>Contact</Typography>
            <Typography sx={{ mt: 0.5 }}>{STORE.email}</Typography>
            <Typography sx={{ mt: 0.5 }}>{STORE.phone}</Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>
              © {new Date().getFullYear()} IJS Stationery — Designed to Inspire
              Writing
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
