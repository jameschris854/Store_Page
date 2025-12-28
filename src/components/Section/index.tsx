import React, { type PropsWithChildren } from "react";
import Reveal from "../Reveal";
import { Skeleton } from "@mui/material";

export default ({ children ,loading = false}: PropsWithChildren & {loading?: boolean}) => {

  return (
    <section style={{ padding: "0 20px" ,maxWidth: 1200, margin: "0 auto",paddingBottom: 24 }}>
      {loading ? <>
         <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 4,marginBottom: 2 ,maxWidth:220 }} />
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 4 ,marginBottom: 6 ,maxWidth: 1200}} />
      </>
      :
      <Reveal>{children}</Reveal>}
    </section>
  );
};
