import a1 from "@/assets/avaliacoes/aval-1.jpg";
import a2 from "@/assets/avaliacoes/aval-2.jpg";
import a3 from "@/assets/avaliacoes/aval-3.jpg";
import a4 from "@/assets/avaliacoes/aval-4.jpg";
import { Star } from "lucide-react";

const items = [a1, a2, a3, a4];

export function Reviews() {
  return (
    <section id="avaliacoes" className="py-24 bg-card/40 border-y border-border">
      <div className="container-px max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Clientes</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Avaliações</h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((src, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-border bg-card shadow-elegant">
              <img src={src} alt={`Avaliação de cliente ${i + 1}`} loading="lazy" className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
