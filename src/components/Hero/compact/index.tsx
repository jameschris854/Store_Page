import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Typography from "../../Typography";
import { PRIMARY, ACCENT } from "../../../constants/globals";

export default function HeroCompact({
  title,
  onBack,
}: {
  title?: string;
  onBack?: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {onBack && (
        <IconButton onClick={onBack} aria-label="Back to home">
          <ArrowBackIcon />
        </IconButton>
      )}
      <Box>
      <Box flexDirection={"row"} display={"flex"} py={2}>
        <Typography responsive fontWeight={600} fontSize={32} color={ACCENT}>IJS</Typography>
        <Typography responsive paddingLeft={1} fontWeight={600} fontSize={32} color={PRIMARY}>STATIONERY</Typography>
      </Box>
        {title && (
          <Typography fontSize={32} color="#475569">
            {title}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
