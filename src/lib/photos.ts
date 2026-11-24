import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

// Generate local, cached WebP files at build time; no runtime image service needed.
export async function responsivePhoto(source: ImageMetadata, requested: number[], quality = 76) {
  const widths = [...new Set(requested.map((width) => Math.min(width, source.width)))].sort((a, b) => a - b);
  const variants = await Promise.all(widths.map(async (width) => ({
    width,
    image: await getImage({ src: source, width, format: "webp", quality })
  })));
  return {
    src: variants[0].image.src,
    srcset: variants.map(({ width, image }) => `${image.src} ${width}w`).join(", "),
    large: variants[variants.length - 1].image.src,
  };
}
