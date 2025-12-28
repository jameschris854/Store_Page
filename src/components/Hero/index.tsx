import { Box, Typography } from "@mui/material"
import { PRIMARY, ACCENT } from "../../App"
import Cross from "../../assets/Icons/Cross"

export default () => {
    return <Box sx={{ textAlign: "center", py: { xs: 6, md: 8 }, px: 2 }}>
            <Cross color={PRIMARY} />

          <Typography variant="h1" color={ACCENT} sx={{ fontWeight: 900 }}>
            IJS
          </Typography>
          <Typography variant="h1" color={PRIMARY} sx={{ fontWeight: 900 }}>
            STATIONERY
          </Typography>

          <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 900 }}>
            SCHOOL · TOYS · GIFTS · OFFICE · ART · SPORTS
          </Typography>

          <Typography variant="subtitle1">
            Your one-stop shop for all stationery needs.
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 14, color: "#475569" }}>
            Visit us on ECR · Open daily
          </Typography>
        </Box>
}