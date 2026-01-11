"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Section from "@/components/ui/Section";
import ChapterHeader from "@/components/ui/ChapterHeader";
import { ArrowRight } from "lucide-react";
import FadeIn from "../ui/FadeIn";

const MapLoader = () => (
  <div className="flex flex-col items-center gap-2 animate-pulse">
    <span className="h-12 w-12 border-4 border-deco-emerald border-t-transparent rounded-full animate-spin" />
    <span className="text-muted-foreground text-sm uppercase tracking-widest">
      Carregando Mapa...
    </span>
  </div>
);

const BrazilMap = dynamic(() => import("@/components/BrazilMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <MapLoader />
    </div>
  ),
});

export default function Hero() {
  return (
    <Section
      className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-gradient-hero "
      id="hero"
    >
      <div className=" w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 z-10">
          <FadeIn>
            <ChapterHeader.Label>Visualização de Dados</ChapterHeader.Label>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display text-foreground leading-tight">
              Censo <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-deco-emerald to-emerald-600">
                Brasil 2022
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={400}>
            <ChapterHeader.Subtitle className="max-w-lg">
              Um retrato de uma nação em transformação. Explore as
              mudanças demográficas, o envelhecimento da população e a
              diversidade regional
            </ChapterHeader.Subtitle>
          </FadeIn>

          <FadeIn delay={600} className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="#capitulo-1"
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-deco-emerald text-slate-950 font-bold rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Começar a Explorar
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeIn>
        </div>

        <FadeIn
          delay={800}
          className="flex-1 w-full h-[500px] lg:h-[700px] relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-deco-emerald/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="w-full h-full relative z-10 lg:scale-110">
            <BrazilMap />
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
