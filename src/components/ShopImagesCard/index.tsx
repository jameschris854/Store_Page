import ShowcaseScroller from "../ShowcaseScroller";

export default function StoreShowcase() {
  return (
    <ShowcaseScroller
      vignette
      height={320}
      role="region"
      aria-roledescription="carousel"
      aria-label="IJS Stationery store photo gallery"
    >
      <img
        src="/storePhotos/1.webp"
        alt="IJS Stationery store front exterior"
        loading="eager"
        fetchPriority="high"
      />
      <img
        src="/storePhotos/2.webp"
        alt="Interior shelves with stationery products at IJS Stationery"
        loading="lazy"
      />
      <img
        src="/storePhotos/3.webp"
        alt="Notebook and paper products display inside IJS Stationery store"
        loading="lazy"
      />
      <img
        src="/storePhotos/4.webp"
        alt="Premium pen section at IJS Stationery store"
        loading="lazy"
      />
      <img
        src="/storePhotos/5.webp"
        alt="Checkout counter at IJS Stationery store"
        loading="lazy"
      />
    </ShowcaseScroller>
  );
}
