import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Services, servicesQuery } from "@/components/site/Services";
import { Hours, hoursQuery } from "@/components/site/Hours";
import { Cuts } from "@/components/site/Cuts";
import { InstagramSection } from "@/components/site/InstagramSection";
import { Location } from "@/components/site/Location";
import { Reviews } from "@/components/site/Reviews";
import { FAQ } from "@/components/site/FAQ";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(hoursQuery),
    ]);
  },
  component: Home,
});

function SectionFallback() {
  return <div className="py-24 text-center text-muted-foreground">Carregando…</div>;
}

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Hours />
        </Suspense>
        <Cuts />
        <InstagramSection />
        <Location />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
