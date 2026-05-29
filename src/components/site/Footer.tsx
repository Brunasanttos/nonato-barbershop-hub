import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone, Scissors } from "lucide-react";
import { SHOP } from "@/lib/barbershop";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="container-px max-w-7xl mx-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="h-5 w-5 text-gold" />
            <span className="font-display text-xl font-bold">Nonato <span className="text-gold">Barbearia</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Tradição em cuidado masculino. Cortes, barba e estética com atenção a cada detalhe.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gold">Contato</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href={SHOP.whatsappUrl}>{SHOP.phone}</a></li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /><a href={SHOP.instagramUrl} target="_blank" rel="noreferrer">{SHOP.instagramHandle}</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /><a href={SHOP.mapsViewUrl} target="_blank" rel="noreferrer">Ver no mapa</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gold">Acesso</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/agendamento" className="hover:text-gold">Agendar horário</Link></li>
            <li><Link to="/admin" className="hover:text-gold">Painel administrativo</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SHOP.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
