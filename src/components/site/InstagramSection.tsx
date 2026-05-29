import { Instagram } from "lucide-react";
import { SHOP } from "@/lib/barbershop";
import c1 from "@/assets/cortes/corte-1.jpg";
import c2 from "@/assets/cortes/corte-2.jpg";
import c3 from "@/assets/cortes/corte-3.jpg";
import c4 from "@/assets/cortes/corte-4.jpg";

export function InstagramSection() {
  return (
    <section className="py-24 bg-card/40 border-y border-border">
      <div className="container-px max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="grid grid-cols-2 gap-3">
          {[c1, c2, c3, c4].map((src, i) => (
            <img key={i} src={src} alt="Instagram preview" loading="lazy" className="rounded-lg aspect-square object-cover border border-border" />
          ))}
        </div>
        <div>
          <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Social</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Siga no Instagram</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Acompanhe os bastidores, novidades e os cortes mais recentes em {SHOP.instagramHandle}.
          </p>
          <a
            href={SHOP.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition"
          >
            <Instagram className="h-5 w-5" />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
