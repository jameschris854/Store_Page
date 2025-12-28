import { Typography, type TypographyProps } from "@mui/material";

/* ---- MUI default font sizes (px) ---- */
const VARIANT_SIZES: Record<string, number> = {
  h1: 96,
  h2: 60,
  h3: 48,
  h4: 34,
  h5: 24,
  h6: 20,
  subtitle1: 16,
  subtitle2: 14,
  body1: 16,
  body2: 14,
  caption: 12,
  overline: 12,
  button: 14,
};

export default function ResponsiveTypography({
  variant = "body1",
  sx,
  children,
  responsive,
  ...props
}: TypographyProps & {responsive?: boolean}) {
  const baseSize = VARIANT_SIZES[variant] ?? 16;
  let sxModified = responsive ? {
        fontSize: {
          xs: Math.round(baseSize * 0.55),
          sm: Math.round(baseSize * 0.7),
          md: baseSize,
        },
        ...sx, // user styles last → override if needed
      } : sx;
  return (
    <Typography
      {...props}
      variant={variant}
      sx={sxModified}
    >
      {children}
    </Typography>
  );
}
