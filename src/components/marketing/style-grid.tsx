import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Engagement Rings", slug: "engagement", image: "photo-1605100804763-247f67b3557e" },
  { name: "Wedding Rings", slug: "wedding", image: "photo-1506630448388-4e683c67ddb0" },
  { name: "Earrings", slug: "earrings", image: "photo-1617038220319-276d3cfab638" },
  { name: "Bracelets", slug: "bracelets", image: "photo-1599643478518-a784e5dc4c8f" },
  { name: "Necklaces", slug: "necklaces", image: "photo-1515562141207-7a88fb7ce338" },
];

export function StyleGrid() {
  return <section className="section"><div className="shell">
    <div className="section-heading"><p className="eyebrow">The GEMOIRE edit</p><h2>Shop by Category</h2></div>
    <div className="style-grid">{categories.map(category => <Link href={`/collections/${category.slug}`} className="style-card" key={category.slug}>
      <div className="style-card-image"><Image src={`https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=700&h=700&q=85`} alt={category.name} width={700} height={700} sizes="(max-width: 1180px) 220px, (max-width: 1440px) 20vw, 240px"/></div>
      <div className="style-card-text"><h3>{category.name}</h3></div>
    </Link>)}</div>
  </div></section>;
}
