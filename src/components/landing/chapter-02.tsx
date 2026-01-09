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
    <Section secondaryBg>
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 2</ChapterHeader.Label>
        <ChapterHeader.Title>Território e Envelhecimento</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus
          dolorum hic tenetur labore facilis sed aliquam architecto mollitia
          eveniet. Magni hic voluptas obcaecati consectetur fugiat accusamus
          commodi dolorum placeat exercitationem!
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
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Onde o Brasil é mais velho?
            </h3>
            <p className="text-muted-foreground mb-4">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio
              voluptatum, cupiditate enim fuga totam maiores adipisci autem
              fugiat quis eius quod quasi deserunt sint iure eaque placeat
              similique commodi iste.
            </p>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              facere magnam sunt blanditiis voluptates illo quae quod alias
              vitae architecto aspernatur ex porro repellendus aut, delectus
              consequuntur provident! Explicabo, incidunt?
            </p>
          </div>

          <div className="bg-white/50 p-4 rounded-xl border shadow-sm flex justify-center min-h-[400px]">
            <ChoroplethMapD3
              data={mapData}
              locationField="nome_uf"
              valueField="idade_mediana_media"
              geoJsonProperty="name"
              width={500}
              height={400}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center mt-8">
          <div className="order-2 lg:order-1 h-[400px] flex flex-col">
            <h3
              className="text-lg font-bold text-center mb-2"
              style={{ color: "#4f46e5" }}
            >
              Índice de Envelhecimento por Raça
            </h3>

            <BarChart
              data={raceData}
              categoryField="Raça"
              valueField="Índice"
              xLabel="Índice (Idosos por 100 Jovens)"
              yLabel="Raça/Cor"
              color="#4f46e5"
              horizontal
            />
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">
              Desigualdade Racial no Envelhecimento
            </h3>
            <p className="text-muted-foreground mb-4">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel
              cupiditate animi ipsa enim repellendus praesentium. Quo,
              reprehenderit. Voluptatum quisquam atque voluptate provident
              reprehenderit, rem quas blanditiis tenetur debitis sint fugiat?
            </p>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut ipsum
              corrupti impedit accusamus repellendus sed, ab excepturi amet
              porro cumque nihil at laboriosam asperiores nostrum, fuga id
              veritatis! Aperiam, optio.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterTwo;
