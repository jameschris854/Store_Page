import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Box,
  Card,
  CardActionArea,
  IconButton,
  Skeleton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router";
import useOffers from "../hooks/useOffers";
import OfferSummary from "./OfferSummary";
import SectionTitle from "./Section/Title";
import Container from "./Container";
import { ACCENT, PRIMARY } from "../constants/globals";

export default function OffersCarousel() {
  const { offers, loading, error } = useOffers();
  const [isScrollable, setIsScrollable] = useState(false);
  const carouselOptions = useMemo(
    () => ({ loop: offers.length > 1, align: "start" as const }),
    [offers.length]
  );
  const plugins = useMemo(
    () => [Autoplay({ delay: 5_000, stopOnInteraction: true })],
    []
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    carouselOptions,
    plugins
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateScrollable = () => {
      setIsScrollable(emblaApi.canScrollNext() || emblaApi.canScrollPrev());
    };

    updateScrollable();
    emblaApi.on("reInit", updateScrollable);
    emblaApi.on("select", updateScrollable);

    return () => {
      emblaApi.off("reInit", updateScrollable);
      emblaApi.off("select", updateScrollable);
    };
  }, [emblaApi]);

  useEffect(() => {
    const autoplay = emblaApi?.plugins().autoplay;
    if (!autoplay || !isScrollable) return;

    autoplay.play();
    return () => autoplay.stop();
  }, [emblaApi, isScrollable]);

  if (!loading && (error || offers.length === 0)) return null;

  return (
    <Box component="section" aria-label="Special offers">
      <Container>
        <SectionTitle title="Current Offers" topLabel="SPECIAL OFFERS" />
        {loading && (
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ width: "100%", height: 220, borderRadius: 2 }}
          />
        )}
        {!loading && !error && offers.length > 0 && (
          <Box sx={{ position: "relative", mx: { xs: -1, sm: -1.5 } }}>
            <Box ref={emblaRef} sx={{ overflow: "hidden", px: { xs: 1, sm: 1.5 }, py: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                {offers.map((offer, index) => (
                  <Card
                    key={offer.id}
                    elevation={0}
                    sx={{
                      flex: {
                        xs: "0 0 min(82vw, 288px)",
                        md: "0 0 320px",
                      },
                      boxSizing: "border-box",
                      overflow: "visible",
                      borderRadius: 2.5,
                      bgcolor: "#fff",
                      border: 0,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/offers/${offer.id}`}
                      state={{ offer, isNew: index < 3 }}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        borderRadius: 2.5,
                        "&:focus-visible": {
                          outline: "3px solid",
                          outlineColor: "primary.main",
                          outlineOffset: -3,
                        },
                      }}
                    >
                      <OfferSummary
                        offer={offer}
                        isNew={index < 3}
                        color={index % 2 === 0 ? ACCENT : PRIMARY}
                      />
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Box>
            {isScrollable && (
              <>
                <IconButton
                  onClick={scrollPrev}
                  aria-label="Show previous offers"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={scrollNext}
                  aria-label="Show next offers"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%)",
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
