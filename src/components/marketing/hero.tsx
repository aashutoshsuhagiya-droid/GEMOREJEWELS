import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";

export function Hero() {
  return <section className="hero campaign-hero"><Image className="campaign-hero-image" src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2200&q=90" alt="Diamond engagement ring presented in a refined campaign setting" fill sizes="100vw" priority/><div className="campaign-hero-shade"/><div className="shell campaign-hero-inner"><div className="campaign-hero-copy"><Reveal><p className="eyebrow eyebrow-light">The forever edit</p></Reveal><Reveal delay={.08}><h1>Lab-grown brilliance.<br/>Made to last.</h1></Reveal><Reveal delay={.16}><p>Discover considered engagement rings crafted around your story, with certified diamonds and a lifetime of care.</p></Reveal><Reveal delay={.24}><div className="hero-actions"><Link href="/collections/engagement" className="button button-white">Shop engagement rings</Link><Link href="/collections/ready-to-ship" className="campaign-hero-link">View ready-to-ship <span aria-hidden="true">→</span></Link></div></Reveal><Reveal delay={.32}><div className="campaign-hero-benefits"><span>IGI-certified diamonds</span><span>Complimentary lifetime care</span><span>Worldwide delivery</span></div></Reveal></div></div></section>;
}
