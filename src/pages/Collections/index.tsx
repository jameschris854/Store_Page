import { useEffect, useState, useMemo } from "react";
import { Box, Grid, Skeleton, Button, Breadcrumbs } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import { getCollectionsTree } from "../../services/collectionservice";
import type { Collection } from "../../types/type";
import Typography from "../../components/Typography";
import CollectionCard from "../../components/CollectionCard";
import EmptyIllustration from "../../assets/empty_category.svg";
import Footer from "../../components/Footer";
import usePlaceData from "../../hooks/usePlaceData";
import Header from "../../Header";
import Container from "../../components/Container";
import Section from "../../components/Section";
import Seo from "../../components/Seo";

export default function CollectionsPage() {
  const { "*": path } = useParams();
  const navigate = useNavigate();
  const { placeData } = usePlaceData();

  const [current, setCurrent] = useState<Collection | null>(null);
  const [children, setChildren] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch collection tree
  useEffect(() => {
    setLoading(true);
    getCollectionsTree().then((treeData) => {
      if (!path) {
        setChildren(treeData);
        setCurrent(null);
      } else {
        const parts = path.split("/");
        let level = treeData;
        let node: Collection | undefined;

        for (const p of parts) {
          node = level.find((n) => n.slug === p);
          if (!node) break;
          level = node.sub;
        }

        setCurrent(node || null);
        setChildren(node?.sub || []);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [path]);

  // SEO
  const pageTitle = useMemo(() => {
    if (!current) return "Collections | IJS Stationery";
    return `${current.name} | Collections | IJS Stationery`;
  }, [current]);

  const pageDescription = useMemo(() => {
    if (!current)
      return "Explore all stationery collections at IJS Stationery.";
    return `Browse ${current.name} collections at IJS Stationery.`;
  }, [current]);

  return (
    <Box
      component="main"
      sx={{
        background: "linear-gradient(#fbfdff,#f7f9ff)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Section (like homepage) */}
      <Header />
      <Container my={4}>
          <Seo title={pageTitle} description={pageDescription} canonical={`https://ijsstationery.com/collections${path ? `/${path}` : ""}`} />

          {/* Breadcrumbs */}
          <Section>
            <Box sx={{ mb: 3, overflowX: "auto" }}>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator="›"
                sx={{
                  "& .MuiBreadcrumbs-ol": {
                    flexWrap: "nowrap",
                  },
                }}
              >
                {/* Home */}
                <Box
                  component="span"
                  onClick={() => navigate("/")}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      color: "#334155",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Home
                </Box>

                {/* Collections */}
                <Box
                  component="span"
                  onClick={() => navigate("/collections")}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      color: "#334155",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Collections
                </Box>

                {/* Dynamic path */}
                {path &&
                  path.split("/").map((slug, i, arr) => {
                    const url = arr.slice(0, i + 1).join("/");
                    const label = slug.replace(/-/g, " ");
                    const isLast = i === arr.length - 1;

                    return isLast ? (
                      <Typography
                        key={url}
                        fontWeight={700}
                        color="#020617"
                        whiteSpace="nowrap"
                        aria-current="page"
                      >
                        {label}
                      </Typography>
                    ) : (
                      <Box
                        key={url}
                        component="span"
                        onClick={() => navigate(`/collections/${url}`)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            color: "#334155",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {label}
                      </Box>
                    );
                  })}
              </Breadcrumbs>
            </Box>
          </Section>
          <Section>
            {/* Main Title for top-level */}
            {!current && !path && (
              <Typography component="h1" fontSize={32} fontWeight={900} mb={3}>
                All Collections
              </Typography>
            )}
          </Section>        
          <Section>
            {/* Empty / Leaf Category */}
            {!loading && path && current && children.length === 0 && (
              <Box sx={{ textAlign: "center", py: 10, px: 2 }}>
                <Box
                  component="img"
                  src={EmptyIllustration}
                  alt="No products available"
                  sx={{ maxWidth: 300, width: "100%", mb: 3 }}
                />
                <Typography
                  fontSize={20}
                  fontWeight={600}
                  color="text.secondary"
                  mb={3}
                >
                  We don’t have products in this category yet. Stay tuned!
                </Typography>
                <Button
                  aria-label="Back to All Collections"
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/collections")}
                  sx={{ fontWeight: 700 }}
                >
                  Back to All Collections
                </Button>
              </Box>
            )}
          </Section>
          <Section>
            {/* Grid / Collections */}
            {!loading && children.length > 0 && (
              <Grid container spacing={3}>
                {children.map((c) => (
                  <CollectionCard key={c.path} collection={c} />
                ))}
              </Grid>
            )}
          </Section>
          <Section>
            {/* Skeleton Loader */}
            {loading && (
              <Grid container spacing={3}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Skeleton
                      variant="rectangular"
                      height={0}
                      sx={{ pt: "100%", borderRadius: 4 }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Section>
      </Container>

      {/* Footer */}
      {placeData?.result && <Footer data={placeData?.result} />}
    </Box>
  );
}
