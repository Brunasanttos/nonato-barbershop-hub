import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Acesso administrativo — Nonato Barbearia" }] }),
  component: AdminAuthPage,
});

function AdminAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin/painel" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/painel" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center container-px">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Scissors className="h-5 w-5 text-gold" />
          <span className="font-display text-lg font-bold">Nonato <span className="text-gold">Barbearia</span></span>
        </Link>
        <div className="rounded-xl border border-border bg-card p-8 shadow-elegant">
          <h1 className="font-display text-2xl font-bold mb-1">Painel administrativo</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Acesse sua conta." : "Crie sua conta de administrador."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:border-gold"
                />
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres. Use uma senha forte.</p>
              )}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-md bg-gradient-gold text-primary-foreground font-semibold shadow-glow disabled:opacity-60"
            >
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Primeira vez?{" "}
                <button onClick={() => setMode("signup")} className="text-gold hover:underline">Criar conta</button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-gold hover:underline">Entrar</button>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          O primeiro cadastro recebe permissão de administrador automaticamente.
        </p>
      </div>
    </div>
  );
}
