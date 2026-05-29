import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, Calendar as CalIcon, Check, Clock, Phone, User } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { servicesQuery } from "@/components/site/Services";
import { hoursQuery } from "@/components/site/Hours";
import {
  createAppointment,
  getBusySlotsForDate,
} from "@/lib/booking.functions";
import { formatDuration, formatPrice, SHOP, WEEKDAYS_PT } from "@/lib/barbershop";

export const Route = createFileRoute("/agendamento")({
  head: () => ({
    meta: [{ title: "Agendar horário — Nonato Barbearia" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(hoursQuery),
    ]);
  },
  component: AgendamentoPage,
});

type Service = { id: string; name: string; price_cents: number; duration_minutes: number };

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateSlots(
  date: Date,
  hours: { weekday: number; morning_open: string | null; morning_close: string | null; afternoon_open: string | null; afternoon_close: string | null; closed: boolean }[],
  durationMin: number,
  busy: { starts_at: string; ends_at: string }[],
) {
  const wd = date.getDay();
  const h = hours.find((x) => x.weekday === wd);
  if (!h || h.closed) return [];
  const intervals: [string, string][] = [];
  if (h.morning_open && h.morning_close) intervals.push([h.morning_open, h.morning_close]);
  if (h.afternoon_open && h.afternoon_close) intervals.push([h.afternoon_open, h.afternoon_close]);

  const step = 15; // minutes
  const result: { iso: string; label: string }[] = [];
  const now = new Date();

  for (const [open, close] of intervals) {
    const [oh, om] = open.split(":").map(Number);
    const [ch, cm] = close.split(":").map(Number);
    const start = new Date(date); start.setHours(oh, om, 0, 0);
    const end = new Date(date); end.setHours(ch, cm, 0, 0);
    for (let t = start.getTime(); t + durationMin * 60_000 <= end.getTime(); t += step * 60_000) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t + durationMin * 60_000);
      if (slotStart < now) continue;
      const conflict = busy.some((b) => {
        const bs = new Date(b.starts_at).getTime();
        const be = new Date(b.ends_at).getTime();
        return slotStart.getTime() < be && slotEnd.getTime() > bs;
      });
      if (conflict) continue;
      result.push({
        iso: slotStart.toISOString(),
        label: `${String(slotStart.getHours()).padStart(2, "0")}:${String(slotStart.getMinutes()).padStart(2, "0")}`,
      });
    }
  }
  return result;
}

function AgendamentoPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: hours } = useSuspenseQuery(hoursQuery);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  const dateStr = date ? toLocalDateStr(date) : null;

  const fetchBusy = useServerFn(getBusySlotsForDate);
  const busyQ = useQuery({
    queryKey: ["busy", dateStr],
    queryFn: () => fetchBusy({ data: { date: dateStr! } }),
    enabled: !!dateStr,
  });

  const slots = useMemo(() => {
    if (!date || !service) return [];
    return generateSlots(date, hours, service.duration_minutes, busyQ.data ?? []);
  }, [date, service, hours, busyQ.data]);

  const next7days = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const wd = d.getDay();
      const h = hours.find((x) => x.weekday === wd);
      if (h && !h.closed) arr.push(d);
    }
    return arr;
  }, [hours]);

  const submit = useServerFn(createAppointment);
  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          service_id: service!.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          starts_at: slotIso!,
        },
      }),
    onSuccess: (r) => setDone(r),
  });

  if (done) {
    const d = new Date(slotIso!);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-32 pb-20 container-px max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-6 shadow-glow">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Agendamento confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Recebemos seu pedido. Em caso de dúvidas chame no WhatsApp <a className="text-gold" href={SHOP.whatsappUrl} target="_blank" rel="noreferrer">{SHOP.phone}</a>.
          </p>
          <div className="rounded-lg border border-border bg-card p-6 text-left space-y-2 mb-8">
            <div className="flex justify-between"><span className="text-muted-foreground">Serviço</span><span className="font-medium">{service!.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span className="font-medium">{d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Horário</span><span className="font-medium text-gold">{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span className="font-medium">{formatPrice(service!.price_cents)}</span></div>
          </div>
          <Link to="/" className="text-gold hover:underline">← Voltar para o site</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 pb-20 container-px max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Agendar horário</h1>
        <p className="text-muted-foreground mb-10">Siga os passos para reservar com {SHOP.name}.</p>

        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</div>
              {n < 3 && <div className={`h-px flex-1 ${step > n ? "bg-gold" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl mb-5">Escolha o serviço</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setService(s); setStep(2); }}
                  className={`text-left p-4 rounded-lg border transition ${service?.id === s.id ? "border-gold bg-gold/5" : "border-border bg-card hover:border-gold/60"}`}
                >
                  <div className="flex justify-between gap-3 mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gold font-bold whitespace-nowrap">{formatPrice(s.price_cents)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(s.duration_minutes)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && service && (
          <div>
            <h2 className="font-display text-2xl mb-2">Escolha data e horário</h2>
            <p className="text-sm text-muted-foreground mb-5">Serviço: <span className="text-gold">{service.name}</span> · {formatDuration(service.duration_minutes)}</p>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-2 px-2">
              {next7days.map((d) => {
                const sel = date && toLocalDateStr(d) === toLocalDateStr(date);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setDate(d); setSlotIso(null); }}
                    className={`shrink-0 px-4 py-3 rounded-lg border min-w-[88px] text-center transition ${sel ? "border-gold bg-gold/10" : "border-border bg-card hover:border-gold/60"}`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{WEEKDAYS_PT[d.getDay()].slice(0, 3)}</div>
                    <div className="font-display text-xl font-bold">{d.getDate()}</div>
                    <div className="text-[10px] text-muted-foreground">{d.toLocaleDateString("pt-BR", { month: "short" })}</div>
                  </button>
                );
              })}
            </div>
            {date && (
              <>
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Horários disponíveis</h3>
                {busyQ.isLoading ? (
                  <p className="text-muted-foreground">Carregando…</p>
                ) : slots.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum horário disponível neste dia.</p>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.iso}
                        onClick={() => setSlotIso(s.iso)}
                        className={`py-2.5 rounded-md border text-sm transition ${slotIso === s.iso ? "border-gold bg-gradient-gold text-primary-foreground" : "border-border bg-card hover:border-gold/60"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-md border border-border hover:border-gold/60">Voltar</button>
              <button
                onClick={() => setStep(3)}
                disabled={!slotIso}
                className="px-5 py-2.5 rounded-md bg-gradient-gold text-primary-foreground font-medium disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && service && slotIso && (
          <div>
            <h2 className="font-display text-2xl mb-5">Seus dados</h2>
            <div className="rounded-lg border border-border bg-card p-5 mb-6 text-sm">
              <div className="flex items-center gap-2 mb-1"><CalIcon className="h-4 w-4 text-gold" />{new Date(slotIso).toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" />{service.name} · {formatPrice(service.price_cents)}</div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
              className="space-y-4 max-w-md"
            >
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required minLength={2} maxLength={100}
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:border-gold"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required minLength={8} maxLength={20}
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:border-gold"
                    placeholder="(31) 99999-9999"
                  />
                </div>
              </div>
              {mutation.isError && (
                <p className="text-destructive text-sm">{(mutation.error as Error).message}</p>
              )}
              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-md border border-border hover:border-gold/60">Voltar</button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow disabled:opacity-60"
                >
                  {mutation.isPending ? "Enviando…" : "Confirmar agendamento"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
