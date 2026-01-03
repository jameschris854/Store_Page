import { Grid, Box } from "@mui/material"
import Container from "../Container"
import StoreTimingCard from "../StoreTimingCard"
import Typography from "../Typography"
import type { googlePlaceDetailsRes } from "../../types/googlePlaceDetailsRes"
import Title from "../Section/Title"

export default ({placeData}: {placeData:googlePlaceDetailsRes}) => {
    return (
        <Container>
            <Title title={"Find Us"} />
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
    )
}