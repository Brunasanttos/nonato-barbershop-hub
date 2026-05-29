import { MapPin, Navigation } from "lucide-react";
import fachada from "@/assets/barbearia-fachada.jpg";
import { SHOP } from "@/lib/barbershop";

export function Location() {
  return (
    <section id="localizacao" className="py-24 container-px max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Onde estamos</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Localização</h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={fachada} alt="Fachada da Nonato Barbearia" loading="lazy" className="w-full h-64 object-cover" />
          <div className="p-6 bg-card">
            <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              Nonato Barbearia
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Venha nos visitar. Ambiente acolhedor, profissionais experientes e o melhor café da região.
            </p>
            <a
              href={SHOP.mapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-gold text-primary-foreground font-medium shadow-glow"
            >
              <Navigation className="h-4 w-4" />
              Traçar rota
            </a>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-border min-h-[400px] bg-card">
          <iframe
            title="Mapa Nonato Barbearia"
            src={SHOP.mapsEmbed}
            className="w-full h-full min-h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
