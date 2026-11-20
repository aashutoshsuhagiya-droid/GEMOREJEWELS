import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    name: "Best Sellers",
    eyebrow: "Our most-loved rings",
    href: "/collections/best-sellers",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&crop=entropy&fit=crop&w=900&h=1200&q=85",
  },
  {
    name: "Gemstone Jewelry",
    eyebrow: "Quietly unforgettable pieces",
    href: "/collections/fine-jewelry",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&crop=entropy&fit=crop&w=1000&h=1300&q=85",
  },
  {
    name: "Lab Grown Diamonds",
    eyebrow: "Certified, ready to set",
    href: "/collections/loose-stones",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&crop=entropy&fit=crop&w=800&h=1067&q=85",
  },
];

export function CollectionTiles() {
  return (
    <section className="section collection-tiles-section">
      <div className="shell">
        <div className="section-heading center">
          <p className="eyebrow">Shop by collection</p>
          <h2>The collections to know</h2>
        </div>
        <div className="collection-tiles">
          {tiles.map(tile => (
            <Link className="collection-tile" href={tile.href} key={tile.name}>
              <span className="collection-tile-media">
                <Image src={tile.image} alt={`${tile.name} collection`} fill sizes="(max-width: 900px) 100vw, 33vw" />
              </span>
              <span className="collection-tile-plate">
                <span className="eyebrow">{tile.eyebrow}</span>
                <span className="collection-tile-name">{tile.name}</span>
                <span className="collection-tile-explore">Explore&nbsp;&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
