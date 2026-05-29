import c1 from "@/assets/cortes/corte-1.jpg";
import c2 from "@/assets/cortes/corte-2.jpg";
import c3 from "@/assets/cortes/corte-3.jpg";
import c4 from "@/assets/cortes/corte-4.jpg";

const items = [
  { src: c1, alt: "Corte masculino na Nonato Barbearia" },
  { src: c2, alt: "Corte com acabamento profissional" },
  { src: c3, alt: "Corte e barba feita na Nonato Barbearia" },
  { src: c4, alt: "Corte moderno na Nonato Barbearia" },
];

export function Cuts() {
  return (
    <section id="cortes" className="py-24 container-px max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Galeria</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Nossos Cortes</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {items.map((it, i) => (
          <div key={i} className="group relative overflow-hidden rounded-lg aspect-[3/4] border border-border">
            <img
              src={it.src}
              alt={it.alt}
              loading="lazy"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
}
