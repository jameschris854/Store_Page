import { type PropsWithChildren, type CSSProperties } from "react";
import Reveal from "../Reveal";
import { Skeleton } from "@mui/material";
import { DESKTOP_MAX_WIDTH } from "../../constants/globals";
export default ({
  children,
  loading = false,
  containerStyle,
}: PropsWithChildren & { loading?: boolean; containerStyle?: CSSProperties }) => {
  const baseStyle: CSSProperties = {
    paddingBottom: 24,
  };

  return (
    <>
      {loading ? (
        <>
          <Skeleton
            variant="rectangular"
            height={30}
            sx={{ borderRadius: 4, marginBottom: 2, maxWidth: 220 }}
          />
          <Skeleton
            variant="rectangular"
            height={320}
            sx={{ borderRadius: 4, marginBottom: 6, maxWidth: DESKTOP_MAX_WIDTH }}
          />
        </>
      ) : (
        <Reveal>{children}</Reveal>
      )}
    </>
  );
};
