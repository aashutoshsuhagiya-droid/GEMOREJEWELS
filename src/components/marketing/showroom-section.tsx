import Image from "next/image";
import Link from "next/link";

const journeySteps = ["Choose a setting", "Select your metal", "Personalise the details"];

export function ShowroomSection() {
  return <section className="section section-forest showroom-home"><div className="shell showroom-grid"><div><p className="eyebrow eyebrow-light">Make it yours</p><h2>Design a ring as individual as your story</h2><p style={{ color: "rgba(255,255,255,.72)", marginTop: 16 }}>Begin with a setting, choose your metal, and refine the diamond details to create something unmistakably yours.</p><div className="city-pills">{journeySteps.map((step, index) => <span key={step} style={{ alignItems: "center", border: "1px solid rgba(255,255,255,.4)", borderRadius: 9999, color: "white", display: "inline-flex", fontSize: 11, gap: 7, padding: "9px 12px" }}><strong style={{ color: "var(--cullen-gold)" }}>0{index + 1}</strong>{step}</span>)}</div><Link href="/collections/engagement" className="button button-white">Start with a setting</Link></div><div className="showroom-photo"><Image src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1300&q=85" alt="Diamond engagement ring crafted around a personal story" width={1000} height={650}/></div></div></section>;
}
