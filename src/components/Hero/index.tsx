import { Box } from "@mui/material"
import { PRIMARY, ACCENT } from "../../App"
import Cross from "../../assets/Icons/Cross"
import Typography from "../Typography"

export default () => {
    return <Box sx={{ textAlign: "center", py: { xs: 6, md: 8 }, px: 2 }}>
            <Cross color={PRIMARY} />

          <Typography responsive variant="h1" fontWeight={900} color={ACCENT}>
            IJS
          </Typography>
          <Typography responsive variant="h1" fontWeight={900}  color={PRIMARY}>
            STATIONERY
          </Typography>

          <Typography responsive variant="h6" fontWeight={900} color={PRIMARY}>
            SCHOOL · TOYS · GIFTS · OFFICE · ART · SPORTS
          </Typography>

          <Typography responsive variant="subtitle1">
            Your one-stop shop for all stationery needs.
          </Typography>

          <Typography responsive fontSize={14} color="#475569" mt={1}>
            Visit us on ECR · Open daily
          </Typography>
        </Box>
}