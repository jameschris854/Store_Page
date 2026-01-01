import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { type ReactNode, useEffect, useMemo, useRef } from "react";

interface ShowcaseScrollerProps {
  children: ReactNode;
  height?: number | { xs: number; md: number };
  slidePadding?: number;
  autoScrollSpeed?: number;
  vignette?: boolean;
}

export default function ShowcaseScroller({
  children,
  height = { xs: 220, md: 320 },
  slidePadding = 0,
  autoScrollSpeed = 0.6,
  vignette
}: ShowcaseScrollerProps) {
  const slides = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children]
  );

  const autoScrollRef = useRef<any>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: 35,
    },
    [
      AutoScroll({
        speed: autoScrollSpeed,
        playOnInit: true,
      }),
    ]
  );

  // Capture plugin instance
  useEffect(() => {
    if (!emblaApi) return;
    autoScrollRef.current = emblaApi.plugins()?.autoScroll;
  }, [emblaApi]);

  const pause = () => autoScrollRef.current?.stop();
  const play = () => autoScrollRef.current?.play();

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box
        sx={{ position: "relative", overflow: "hidden" }}
        onMouseEnter={pause}
        onMouseLeave={play}
        onTouchStart={pause} // mobile intent → permanent pause
      >
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {slides.map((slide, index) => (
              <Box
                key={index}
                sx={{
                  flex: "0 0 auto",
                  height,
                  display: "flex",
                  alignItems: "center",
                  px: slidePadding,
                }}
              >
                {slide}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Black edge fade */}
        {vignette && <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              linear-gradient(
                to right,
                rgba(0,0,0,0.6) 0%,
                rgba(0,0,0,0.0) 12%,
                rgba(0,0,0,0.0) 88%,
                rgba(0,0,0,0.6) 100%
              )
            `,
          }}
        />}
      </Box>

      {/* Arrows */}
      <IconButton
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="scroll to prev image"
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          color: "#fff",
          opacity: 0.7,
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={() => emblaApi?.scrollNext()}
        aria-label="scroll to next image"
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          color: "#fff",
          opacity: 0.7,
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
