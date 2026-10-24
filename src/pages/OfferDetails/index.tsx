import {
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from "react-router";
import { Alert, Box, Button, Chip, Skeleton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Container from "../../components/Container";
import OfferCountdown from "../../components/OfferCountdown";
import Seo from "../../components/Seo";
import useOffers from "../../hooks/useOffers";
import type { Offer } from "../../types/offer";

function isOffer(value: unknown): value is Offer {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Offer>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    (candidate.expiresAt === null ||
      (typeof candidate.expiresAt === "string" &&
        Number.isFinite(Date.parse(candidate.expiresAt))))
  );
}

export default function OfferDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeState = location.state as
    | { offer?: unknown; isNew?: unknown }
    | null;
  const navigatedOffer =
    navigationType === "PUSH" &&
    isOffer(routeState?.offer) &&
    routeState.offer.id === id
      ? routeState.offer
      : undefined;
  const { offers, loading, error } = useOffers(!navigatedOffer);
  const fetchedOffer = offers.find((item) => item.id === id);
  const offer = navigatedOffer ?? fetchedOffer;
  const offerIndex = offers.findIndex((item) => item.id === id);
  const isNew = navigatedOffer
    ? routeState?.isNew === true
    : offerIndex >= 0 && offerIndex < 3;
  const isUnavailable =
    !loading && !error && !offer;
  const title = offer
    ? `${offer.title} | IJS Stationery`
    : "Offer | IJS Stationery";
  const description = offer?.description ?? "Discover current offers at IJS Stationery.";
  const onBack = () => navigate("/");
  const expiryDate = offer?.expiresAt ? new Date(offer.expiresAt) : null;
  const formattedExpiry = expiryDate
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(expiryDate)
    : "";

  return (
    <Box component="main">
      <Container my={4}>
        <Seo title={title} description={description} />
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        {loading && (
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ width: "100%", maxWidth: 800, height: 260, borderRadius: 2 }}
          />
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {isUnavailable && (
          <Alert severity="info">This offer is unavailable or has expired.</Alert>
        )}
        {!loading && offer && (
          <Box sx={{ maxWidth: 760, py: { xs: 2, sm: 4 } }}>
            {isNew && (
              <Chip
                label="NEW OFFER"
                color="secondary"
                size="small"
                sx={{ mb: 2, fontWeight: 700 }}
              />
            )}
            <Typography component="h1" variant="h4" fontWeight={700} mb={2}>
              {offer.title}
            </Typography>
            <Typography color="text.secondary" fontSize={18} lineHeight={1.7}>
              {offer.description}
            </Typography>
            <Box
              sx={{
                mt: 4,
                py: 2.5,
                borderTop: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography fontWeight={700} mb={0.5}>
                {expiryDate ? `Offer ends ${formattedExpiry}` : "No expiry date"}
              </Typography>
              <OfferCountdown expiresAt={offer.expiresAt} />
            </Box>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
              }}
            >
              <StorefrontOutlinedIcon color="primary" />
              <Typography color="text.secondary">
                Show this offer to the shopkeeper in-store.
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
