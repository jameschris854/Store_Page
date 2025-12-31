import HeroCompact from "../components/Hero/compact";
import Container from "../components/Container";
import type { BoxProps } from "@mui/material";

export default function Header({...props}:BoxProps) {
  return (
    <Container paddingY={1} borderBottom={"1px #dfdfdf solid"} {...props} >
        <header >
            <HeroCompact  />
        </header>
    </Container>
  );
}