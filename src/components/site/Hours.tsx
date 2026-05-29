import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getBusinessHours } from "@/lib/booking.functions";
import { WEEKDAYS_PT } from "@/lib/barbershop";

export const hoursQuery = queryOptions({
  queryKey: ["business-hours"],
  queryFn: () => getBusinessHours(),
});

const fmt = (t: string | null) => (t ? t.slice(0, 5) : "");

export function Hours() {
  const { data } = useSuspenseQuery(hoursQuery);
  const sorted = [...data].sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7));
  return (
    <section id="horarios" className="py-24 bg-card/40 border-y border-border">
      <div className="container-px max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold uppercase tracking-[0.25em] text-xs mb-3">Horários</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Funcionamento</h2>
        </div>
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          {sorted.map((h) => (
            <div key={h.weekday} className="flex items-center justify-between px-6 py-4">
              <span className="font-medium">{WEEKDAYS_PT[h.weekday]}</span>
              {h.closed ? (
                <span className="text-destructive text-sm">Fechado</span>
              ) : (
                <span className="text-gold font-mono text-sm">
                  {fmt(h.morning_open)}–{fmt(h.morning_close)}
                  {h.afternoon_open && (
                    <>
                      {" · "}
                      {fmt(h.afternoon_open)}–{fmt(h.afternoon_close)}
                    </>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
