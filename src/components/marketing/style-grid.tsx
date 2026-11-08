import Image from "next/image";
import Link from "next/link";
import { adminRepository } from "@/lib/admin-repository";

export function StyleGrid() {
  const collections = adminRepository.list("collections").filter(collection => collection.homepage).sort((a, b) => a.homepageOrder - b.homepageOrder);
  return <section className="section"><div className="shell"><div className="section-heading"><p className="eyebrow">The GEMOIRE edit</p><h2>Shop by Collection</h2></div><div className="style-grid">{collections.map(collection => <Link href={`/collections/${collection.slug}`} className="style-card" key={collection.id}><Image src={collection.coverImage} alt={`${collection.name} collection`} width={700} height={700}/><div className="style-card-text"><h3>{collection.name}</h3><span>Explore →</span></div></Link>)}</div>{!collections.length ? <p className="lede">Our next collection edit is being prepared.</p> : null}</div></section>;
}
