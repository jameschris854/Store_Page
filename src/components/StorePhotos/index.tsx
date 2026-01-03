import { Box } from "@mui/material";
import Container from "../Container";
import ShopImagesCard from "../ShopImagesCard";
import Title from "../Section/Title";

export default () => {
  return (
    <Container>
      <Title title={"Store Photos"} />
      <Box
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(2,6,23,0.08)",
        }}
      >
        <ShopImagesCard />
      </Box>
    </Container>
  );
};
