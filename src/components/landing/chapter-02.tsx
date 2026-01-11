"use client";

import { useState, useEffect } from "react";
import MetricCard from "../MetricCard";
import ChapterHeader from "../ui/ChapterHeader";
import Section from "../ui/Section";
import BarChart from "../charts/BarChart";
import ChoroplethMapD3 from "../charts/ChoroplethMapD3";
import { type ChartData } from "@/types/api";

const ChapterTwo = () => {
  const [mapData, setMapData] = useState<ChartData>([]);
  const [raceData, setRaceData] = useState<ChartData>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMap = await fetch("/api/aging-population-by-state");
        if (!resMap.ok) throw new Error("Failed to fetch aging map data");
        const rawMapData: ChartData = await resMap.json();

        setMapData(
          rawMapData.map((d) => ({
            ...d,
            idade_mediana_media: Number(d.idade_mediana_media),
          }))
        );

        const resRace = await fetch("/api/aging-index-by-race");
        if (!resRace.ok) throw new Error("Failed to fetch aging race data");
        const rawRaceData: ChartData = await resRace.json();
        setRaceData(
          rawRaceData.map((d) => ({
            Raça: d.cor_raca,
            Índice: Number(d.indice_envelhecimento),
          }))
        );
      } catch (error) {
        console.error("Error fetching Chapter 2 data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Section secondaryBg id="capitulo-2">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 2</ChapterHeader.Label>
        <ChapterHeader.Title>Território e Envelhecimento</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          O Brasil deixa de ser um país majoritariamente jovem. O Censo 2022
          revela uma transição demográfica acelerada, com o alargamento do topo
          da pirâmide etária e profundas diferenças regionais que impactam o
          futuro das políticas públicas.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <MetricCard.Root>
            <MetricCard.Value>35 Anos</MetricCard.Value>
            <MetricCard.Label>Idade Mediana Nacional</MetricCard.Label>
            <MetricCard.Description>
              Aumento de 6 anos em relação a 2010 (29 anos)
            </MetricCard.Description>
          </MetricCard.Root>
          <MetricCard.Root>
            <MetricCard.Value>80,0</MetricCard.Value>
            <MetricCard.Label>Índice de Envelhecimento</MetricCard.Label>
            <MetricCard.Description>
              Existem 80 idosos (65+) para cada 100 crianças (0-14)
            </MetricCard.Description>
          </MetricCard.Root>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">
              Onde o Brasil é mais velho?
            </h3>
            <p className="text-muted-foreground mb-4">
              A geografia do envelhecimento divide o país. O{" "}
              <strong>Sul e Sudeste</strong>, destacados em tons mais fortes no
              mapa, lideram o processo. Estados como São Paulo e Paraná possuem as maiores idades medianas, reflexo de uma
              transição demográfica iniciada mais cedo.
            </p>
            <p className="text-muted-foreground">
              Em contraste, o <strong>Norte e partes do Centro-Oeste</strong>{" "}
              ainda mantêm uma estrutura etária mais jovem. Regiões como Roraima
              e Amapá apresentam idades medianas significativamente menores,
              impulsionadas por taxas de natalidade que, embora em queda, ainda
              superam a média nacional.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm flex justify-center min-h-[400px]">
            <ChoroplethMapD3
              data={mapData}
              locationField="nome_uf"
              valueField="idade_mediana_media"
              geoJsonProperty="name"
              width={500}
              height={400}
              tooltipFields={{
                idade_mediana_media: "Idade Mediana",
              }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center mt-8">
          <div className="order-2 lg:order-1 h-[400px] flex flex-col">
            <h3
              className="text-lg font-bold text-center mb-2"
              style={{ color: "#34d399" }}
            >
              Índice de Envelhecimento por Raça
            </h3>

            <BarChart
              data={raceData}
              categoryField="Raça"
              valueField="Índice"
              xLabel="Índice (Idosos por 100 Jovens)"
              yLabel="Raça/Cor"
              color="#34d399"
              horizontal
            />
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-teal-400 mb-4">
              Desigualdade Racial no Envelhecimento
            </h3>
            <p className="text-muted-foreground mb-4">
              O envelhecimento não atinge todos os grupos da mesma forma. A população <strong>Amarela</strong> registram índices de
              envelhecimento muito superiores à média nacional, indicando maior
              longevidade e menor fecundidade.
            </p>
            <p className="text-muted-foreground">
              Já as populações <strong>Preta, Branca, Parda e Indígena</strong> possuem
              uma estrutura etária comparativamente mais jovem. No entanto, o
              gráfico revela que a transição demográfica já é uma realidade para
              todos, com índices crescentes em relação aos censos anteriores.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterTwo;
