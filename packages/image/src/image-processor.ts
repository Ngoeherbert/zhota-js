export interface ProcessedImage { src: string; srcSet: string; width: number; height: number; placeholder?: string }
const sizes = [640, 750, 828, 1080, 1200, 1920]
export async function processImage(src: string, width: number, height: number): Promise<ProcessedImage> {
  return { src, srcSet: sizes.filter((size) => size <= Math.max(width, 640)).map((size) => `${src}?w=${size} ${size}w`).join(', '), width, height }
}
