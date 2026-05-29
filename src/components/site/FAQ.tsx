import { MessageCircle, Phone } from "lucide-react";
import { SHOP } from "@/lib/barbershop";

export function FAQ() {
  return (
    <section className="py-24 container-px max-w-4xl mx-auto text-center">
      <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Suporte</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Tem alguma dúvida?</h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Fale conosco direto pelo WhatsApp. Atendimento rápido para tirar dúvidas, conferir disponibilidade ou consultar condições especiais.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={SHOP.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition"
        >
          <MessageCircle className="h-5 w-5" />
          Chamar no WhatsApp
        </a>
        <a
          href={`tel:+${SHOP.phoneDigits}`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-gold/50 text-gold hover:bg-gold/10 transition"
        >
          <Phone className="h-5 w-5" />
          {SHOP.phone}
        </a>
      </div>
    </section>
  );
}
