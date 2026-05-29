import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { getServices } from "@/lib/booking.functions";
import { formatDuration, formatPrice } from "@/lib/barbershop";

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => getServices(),
});

export function Services() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  return (
    <section id="servicos" className="py-24 container-px max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Nossos Serviços</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Cuidado completo</h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Da clássica navalhada quente aos tratamentos modernos para cabelo e barba.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="group rounded-lg border border-border bg-card p-5 hover:border-gold/60 transition shadow-elegant/0 hover:shadow-elegant"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-lg leading-tight">{s.name}</h3>
              <span className="text-gold font-bold whitespace-nowrap">{formatPrice(s.price_cents)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(s.duration_minutes)}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          to="/agendamento"
          className="inline-flex px-7 py-3 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow"
        >
          Agendar um serviço
        </Link>
      </div>
    </section>
  );
}
