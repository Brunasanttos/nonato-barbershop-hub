import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, LogOut, Phone, Trash2, XCircle, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteAppointment,
  adminListAppointments,
  adminUpdateAppointmentStatus,
  checkAdminRole,
} from "@/lib/admin.functions";
import { formatPrice, SHOP } from "@/lib/barbershop";

export const Route = createFileRoute("/admin/painel")({
  head: () => ({ meta: [{ title: "Painel — Nonato Barbearia" }] }),
  component: AdminDashboard,
});

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};
const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  completed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) navigate({ to: "/admin" });
      else setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchList = useServerFn(adminListAppointments);
  const fetchRole = useServerFn(checkAdminRole);
  const updateFn = useServerFn(adminUpdateAppointmentStatus);
  const deleteFn = useServerFn(adminDeleteAppointment);

  const roleQ = useQuery({
    queryKey: ["admin-role"],
    queryFn: () => fetchRole(),
    enabled: authChecked,
  });

  const listQ = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => fetchList(),
    enabled: authChecked && roleQ.data?.isAdmin === true,
  });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" }) =>
      updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  }

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  if (roleQ.data && !roleQ.data.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container-px text-center">
        <h1 className="font-display text-2xl mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground mb-6">Sua conta não possui permissão de administrador.</p>
        <button onClick={logout} className="px-5 py-2 rounded-md border border-gold/50 text-gold">Sair</button>
      </div>
    );
  }

  const appts = listQ.data ?? [];
  const upcoming = appts.filter((a) => new Date(a.starts_at) >= new Date() && a.status !== "cancelled");
  const past = appts.filter((a) => !upcoming.includes(a));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container-px max-w-7xl mx-auto h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-gold" />
            <span className="font-display text-lg font-bold">Nonato <span className="text-gold">Admin</span></span>
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>
      <main className="container-px max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Contato da barbearia: {SHOP.phone}</p>
        </div>

        <Section title={`Próximos (${upcoming.length})`}>
          {listQ.isLoading ? <p className="text-muted-foreground">Carregando…</p> :
            upcoming.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum agendamento próximo.</p> :
            <AppointmentTable
              items={upcoming}
              onUpdate={(id, status) => updateMut.mutate({ id, status })}
              onDelete={(id) => { if (confirm("Excluir agendamento?")) deleteMut.mutate(id); }}
            />}
        </Section>

        <Section title={`Histórico (${past.length})`}>
          {past.length === 0 ? <p className="text-muted-foreground text-sm">Sem histórico ainda.</p> :
            <AppointmentTable
              items={past}
              onUpdate={(id, status) => updateMut.mutate({ id, status })}
              onDelete={(id) => { if (confirm("Excluir agendamento?")) deleteMut.mutate(id); }}
            />}
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold mb-4 text-gold">{title}</h2>
      <div className="rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    </section>
  );
}

type Appt = {
  id: string;
  customer_name: string;
  customer_phone: string;
  starts_at: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  service: { name: string; price_cents: number } | null;
};

function AppointmentTable({
  items,
  onUpdate,
  onDelete,
}: {
  items: Appt[];
  onUpdate: (id: string, status: Appt["status"]) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-border">
      {items.map((a) => {
        const d = new Date(a.starts_at);
        return (
          <div key={a.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{a.customer_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[a.status]}`}>{statusLabel[a.status]}</span>
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`https://wa.me/55${a.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-gold">{a.customer_phone}</a>
                </span>
                <span className="text-gold">{a.service?.name} · {a.service ? formatPrice(a.service.price_cents) : ""}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.status === "pending" && (
                <button onClick={() => onUpdate(a.id, "confirmed")} className="px-3 py-1.5 text-xs rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                </button>
              )}
              {a.status !== "completed" && a.status !== "cancelled" && (
                <button onClick={() => onUpdate(a.id, "completed")} className="px-3 py-1.5 text-xs rounded-md bg-blue-600/20 text-blue-300 border border-blue-600/40">
                  Concluir
                </button>
              )}
              {a.status !== "cancelled" && (
                <button onClick={() => onUpdate(a.id, "cancelled")} className="px-3 py-1.5 text-xs rounded-md bg-red-600/20 text-red-300 border border-red-600/40 inline-flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Cancelar
                </button>
              )}
              <button onClick={() => onDelete(a.id)} className="px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground border border-border inline-flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
