export type Metal = "Platinum" | "18ct Yellow Gold" | "18ct Rose Gold" | "18ct White Gold";
export type StorefrontProductImage = { src: string; alt: string; isPrimary?: boolean };
export type Product = {
  slug: string;
  name: string;
  collection: "Aaria" | "Kavya" | "Mira";
  category: "engagement" | "wedding" | "fine-jewelry";
  setting: string;
  shape: string;
  carat: string;
  clarity: string;
  metal: Metal;
  audPrice: number;
  usdPrice: number;
  rating: number;
  reviewCount: number;
  tag?: "New" | "Bestseller";
  image: string;
  imageAlt: string;
  images?: StorefrontProductImage[];
  hoverImage?: string;
  description: string;
  details?: string;
  igeCertNo?: string;
  color?: string;
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85&sat=-20",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85"
];

const blueprints: Array<Pick<Product, "name" | "collection" | "category" | "setting" | "shape" | "carat" | "clarity" | "metal" | "audPrice" | "tag">> = [
  { name: "Aaria Classic Solitaire", collection: "Aaria", category: "engagement", setting: "Solitaire", shape: "Round", carat: "1.20ct", clarity: "VVS2", metal: "18ct Yellow Gold", audPrice: 3490, tag: "Bestseller" },
  { name: "Aaria East-West Oval", collection: "Aaria", category: "engagement", setting: "East-West", shape: "Oval", carat: "1.50ct", clarity: "VS1", metal: "18ct White Gold", audPrice: 4180, tag: "New" },
  { name: "Aaria Bezel Light", collection: "Aaria", category: "engagement", setting: "Bezel", shape: "Round", carat: "1.00ct", clarity: "VVS1", metal: "Platinum", audPrice: 3790 },
  { name: "Aaria Pear Poise", collection: "Aaria", category: "engagement", setting: "Solitaire", shape: "Pear", carat: "1.30ct", clarity: "VS1", metal: "18ct Rose Gold", audPrice: 3910 },
  { name: "Aaria Emerald Line", collection: "Aaria", category: "engagement", setting: "Solitaire", shape: "Emerald", carat: "1.40ct", clarity: "VVS2", metal: "18ct Yellow Gold", audPrice: 4060 },
  { name: "Aaria Marquise Arc", collection: "Aaria", category: "engagement", setting: "Solitaire", shape: "Marquise", carat: "1.10ct", clarity: "VS1", metal: "18ct White Gold", audPrice: 3650 },
  { name: "Aaria Cushion Frame", collection: "Aaria", category: "engagement", setting: "Bezel", shape: "Cushion", carat: "1.20ct", clarity: "VVS2", metal: "Platinum", audPrice: 3880 },
  { name: "Aaria Radiant Still", collection: "Aaria", category: "engagement", setting: "Solitaire", shape: "Radiant", carat: "1.30ct", clarity: "VS1", metal: "18ct Yellow Gold", audPrice: 3990 },
  { name: "Kavya Halo Bloom", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Oval", carat: "1.30ct", clarity: "VVS2", metal: "18ct White Gold", audPrice: 4380, tag: "Bestseller" },
  { name: "Kavya Round Halo", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Round", carat: "1.10ct", clarity: "VS1", metal: "18ct Yellow Gold", audPrice: 4120 },
  { name: "Kavya Pear Halo", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Pear", carat: "1.20ct", clarity: "VVS1", metal: "18ct Rose Gold", audPrice: 4290 },
  { name: "Kavya Cushion Glow", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Cushion", carat: "1.30ct", clarity: "VS1", metal: "Platinum", audPrice: 4550, tag: "New" },
  { name: "Kavya Emerald Halo", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Emerald", carat: "1.40ct", clarity: "VVS2", metal: "18ct White Gold", audPrice: 4690 },
  { name: "Kavya Radiant Bloom", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Radiant", carat: "1.20ct", clarity: "VS1", metal: "18ct Yellow Gold", audPrice: 4420 },
  { name: "Kavya Secret Halo", collection: "Kavya", category: "engagement", setting: "Halo", shape: "Oval", carat: "1.50ct", clarity: "VVS1", metal: "Platinum", audPrice: 4930 },
  { name: "Kavya Toi Et Moi", collection: "Kavya", category: "engagement", setting: "Toi et Moi", shape: "Pear", carat: "1.40ct", clarity: "VS1", metal: "18ct Rose Gold", audPrice: 5170 },
  { name: "Mira Three-Stone", collection: "Mira", category: "wedding", setting: "Three-Stone", shape: "Round", carat: "1.50ct", clarity: "VVS2", metal: "Platinum", audPrice: 4820, tag: "Bestseller" },
  { name: "Mira Oval Trilogy", collection: "Mira", category: "wedding", setting: "Three-Stone", shape: "Oval", carat: "1.70ct", clarity: "VS1", metal: "18ct Yellow Gold", audPrice: 4990 },
  { name: "Mira Emerald Trio", collection: "Mira", category: "wedding", setting: "Three-Stone", shape: "Emerald", carat: "1.60ct", clarity: "VVS1", metal: "18ct White Gold", audPrice: 5110 },
  { name: "Mira Pear Trilogy", collection: "Mira", category: "wedding", setting: "Three-Stone", shape: "Pear", carat: "1.40ct", clarity: "VS1", metal: "18ct Rose Gold", audPrice: 4770, tag: "New" },
  { name: "Mira Diamond Band", collection: "Mira", category: "wedding", setting: "Eternity", shape: "Round", carat: "0.80ct", clarity: "VVS2", metal: "18ct White Gold", audPrice: 2890 },
  { name: "Mira Soft Curve", collection: "Mira", category: "wedding", setting: "Curved Band", shape: "Round", carat: "0.60ct", clarity: "VS1", metal: "18ct Yellow Gold", audPrice: 2430 },
  { name: "Mira Diamond Hoops", collection: "Mira", category: "fine-jewelry", setting: "Hoops", shape: "Round", carat: "0.75ct", clarity: "VVS2", metal: "18ct Yellow Gold", audPrice: 1980 },
  { name: "Mira Pendant Light", collection: "Mira", category: "fine-jewelry", setting: "Pendant", shape: "Round", carat: "0.50ct", clarity: "VS1", metal: "18ct White Gold", audPrice: 1690 }
];

export const products: Product[] = blueprints.map((product, index) => ({
  ...product,
  slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  usdPrice: Math.round(product.audPrice * 0.65),
  rating: Number((4.7 + (index % 3) * 0.1).toFixed(1)),
  reviewCount: 78 + index * 11,
  image: placeholderImages[index % placeholderImages.length],
  imageAlt: `Placeholder product photography for ${product.name}`,
  description: "A considered proportion of lab-grown diamonds and precious metal, made for the everyday moments that become part of your story."
}));

export const formatAud = (value: number) => `AUD $${value.toLocaleString("en-AU")}`;
export const formatUsd = (value: number) => `USD $${value.toLocaleString("en-US")}`;
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
