import { type PropsWithChildren, type CSSProperties } from "react";
import Reveal from "../Reveal";
import { Box, Skeleton } from "@mui/material";
import { DESKTOP_MAX_WIDTH } from "../../constants/globals";
import Container from "../Container";
export default ({
  children,
  loading = false,
}: PropsWithChildren & { loading?: boolean; containerStyle?: CSSProperties }) => {


  return (
    <>
      {loading ? (
        <Container>
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ borderRadius: 4, marginBottom: 2, maxWidth: {
              xs: 100,
              sm: 150,
              md: 180,
              lg: 220
            } ,height:"auto",aspectRatio:8}}
          />
          <Skeleton
            variant="rectangular"
            sx={{ borderRadius: 4, marginBottom: 6,width:"100%", maxWidth: DESKTOP_MAX_WIDTH,aspectRatio:2,height:"auto",maxHeight:320}}
          />
        </Container>
      ) : (
        <Reveal><Box pt={3} pb={3}>{children}</Box></Reveal>
      )}
    </>
  );
};
