import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("id,name,price_cents,duration_minutes,sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBusinessHours = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("business_hours")
    .select("weekday,morning_open,morning_close,afternoon_open,afternoon_close,closed")
    .order("weekday");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBusySlotsForDate = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ date: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { data: slots, error } = await supabaseAdmin.rpc("get_busy_slots", {
      _date: data.date,
    });
    if (error) throw new Error(error.message);
    return (slots ?? []) as { starts_at: string; ends_at: string }[];
  });

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z.string().trim().min(8).max(30),
  starts_at: z.string(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((d) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: svc, error: svcErr } = await supabaseAdmin
      .from("services")
      .select("duration_minutes")
      .eq("id", data.service_id)
      .single();
    if (svcErr || !svc) throw new Error("Serviço não encontrado");

    const start = new Date(data.starts_at);
    const end = new Date(start.getTime() + svc.duration_minutes * 60_000);

    // Conflict check
    const { data: existing } = await supabaseAdmin
      .from("appointments")
      .select("id,starts_at,ends_at,status")
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date(start.getTime() - 4 * 60 * 60_000).toISOString())
      .lte("starts_at", new Date(start.getTime() + 4 * 60 * 60_000).toISOString());

    const conflict = (existing ?? []).some((a) => {
      const aS = new Date(a.starts_at).getTime();
      const aE = new Date(a.ends_at).getTime();
      return start.getTime() < aE && end.getTime() > aS;
    });
    if (conflict) throw new Error("Horário já reservado. Escolha outro.");

    const { data: created, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        service_id: data.service_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });
