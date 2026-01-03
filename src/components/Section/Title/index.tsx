import { Box } from "@mui/material";
import Typography from "../../Typography";
import { ACCENT, PRIMARY } from "../../../constants/globals";

export default ({title,topLabel}: {title: string ,topLabel?: string}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {topLabel && <Typography fontSize={16} letterSpacing={4} color={ACCENT} mb={0.5}>
        {topLabel}
      </Typography>}

      {title && <Typography fontSize={38} fontWeight={600} color={PRIMARY}>
        {title}
      </Typography>}
    </Box>
  );
};
