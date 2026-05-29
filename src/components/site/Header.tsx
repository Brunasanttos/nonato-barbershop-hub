import { Link } from "@tanstack/react-router";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";
import { SHOP } from "@/lib/barbershop";

const navLinks = [
  { label: "Serviços", href: "#servicos" },
  { label: "Horários", href: "#horarios" },
  { label: "Nossos Cortes", href: "#cortes" },
  { label: "Localização", href: "#localizacao" },
  { label: "Avaliações", href: "#avaliacoes" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="container-px max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Scissors className="h-5 w-5 text-gold transition group-hover:rotate-12" />
          <span className="font-display text-lg font-bold tracking-wide">
            Nonato <span className="text-gold">Barbearia</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-gold transition">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/agendamento"
            className="px-4 py-2 rounded-md bg-gradient-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition shadow-glow"
          >
            Agendar agora
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground" aria-label="menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-px max-w-7xl mx-auto py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 text-muted-foreground hover:text-gold">
                {l.label}
              </a>
            ))}
            <Link to="/agendamento" onClick={() => setOpen(false)} className="px-4 py-2 mt-2 rounded-md bg-gradient-gold text-primary-foreground font-medium text-center">
              Agendar agora
            </Link>
            <a href={SHOP.whatsappUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground">
              {SHOP.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
