import { Helmet } from "react-helmet-async";

type Props = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  url?: string;
  jsonLd?: object | null;
};

const SITE_NAME = "IJS Stationery";
const DEFAULT_TITLE = `${SITE_NAME} - School, Office & Art Supplies`;
const DEFAULT_DESCRIPTION =
  "IJS Stationery - Premium stationery, school supplies, toys, gifts, office essentials, and art materials in Chennai.";
const DEFAULT_CANONICAL = "https://ijsstationery.vercel.app";

export default function Seo({
  title,
  description,
  canonical,
  image,
  url,
  jsonLd,
}: Props) {
  const pageTitle = title ? `${title}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageCanonical = canonical || DEFAULT_CANONICAL;
  const pageImage = image || `${DEFAULT_CANONICAL}/og-image.jpg`;
  const pageUrl = url || pageCanonical;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
