import Cross from "../../assets/Icons/Cross"
import Typography from "../Typography"
import { ACCENT, PRIMARY } from "../../constants/globals"
import Container from "../Container"

export default () => {
    return <Container textAlign={"center"} py={{xs: 6 ,md: 8}} px={2}>
            <Cross color={PRIMARY} />

          <Typography responsive variant="h1" fontSize={80} fontWeight={600} color={ACCENT}>
            IJS
          </Typography>
          <Typography responsive variant="h1" fontSize={80} fontWeight={600} color={PRIMARY}>
            STATIONERY
          </Typography>

          <Typography responsive fontSize={20} variant="h2" fontWeight={600} color={PRIMARY}>
            SCHOOL · TOYS · GIFTS · OFFICE · ART · SPORTS
          </Typography>

          <Typography responsive fontSize={16} mt={2} >
            Your one-stop shop for all stationery needs.
          </Typography>

          <Typography responsive fontSize={14} color="#475569" mt={1}>
            Visit us on ECR · Open daily
          </Typography>
        </Container>
}