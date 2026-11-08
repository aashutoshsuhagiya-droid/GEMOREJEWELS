import Link from "next/link";
import { adminRepository } from "@/lib/admin-repository";

export function InstagramFeed() {
  const settings = adminRepository.getSettings();
  const products = new Map(adminRepository.listProducts().map(product => [product.id, product]));
  const items = adminRepository.list("instagram").filter(item => !item.underReview).sort((a, b) => a.position - b.position).slice(0, 12);
  return <section className="section"><div className="shell"><div className="section-heading"><p className="eyebrow">In your words</p><h2>{settings.instagramHandle || "@GEMOIREJEWELSLLP"}</h2></div>{items.length ? <div className="instagram-strip">{items.map((item, index) => { const product = item.productId ? products.get(item.productId) : undefined; return <Link className="instagram-card" href={product ? `/products/${product.slug}` : "#top"} key={item.id}><img src={item.src} alt={product ? `${product.name} from ${settings.instagramHandle}` : `Community jewellery image ${index + 1}`} width={600} height={600}/><span aria-label={`View story ${index + 1}`}>▷</span></Link>; })}</div> : <p className="lede">Our next community edit is under review.</p>}</div></section>;
}
