import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "@tanstack/react-router";
import { Calendar, Phone } from "lucide-react";
import { SHOP } from "@/lib/barbershop";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <img
        src={heroBg}
        alt="Interior da Nonato Barbearia"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      <div className="absolute inset-0 bg-background/40" />
      <div className="relative container-px max-w-7xl mx-auto pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full border border-gold/40 text-gold text-xs uppercase tracking-[0.2em] mb-6">
            Desde sempre. Para sempre.
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
            Nonato <span className="text-gold">Barbearia</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl">
            Cortes masculinos com tradição, estilo e precisão. Reserve o seu horário em poucos cliques.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/agendamento"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition"
            >
              <Calendar className="h-5 w-5" />
              Agendar horário
            </Link>
            <a
              href={SHOP.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-gold/50 text-gold hover:bg-gold/10 transition"
            >
              <Phone className="h-5 w-5" />
              {SHOP.phone}
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
