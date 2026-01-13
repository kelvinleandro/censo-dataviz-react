"use client";

import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";
import { useEffect, useState } from "react";
import { ChartData } from "@/types/api";
import ScatterPlot from "../charts/ScatterPlot";
import StackedBarChart from "../charts/StackedBarChart";

const ChapterSix = () => {
  const [ageVsLiteracy, setAgeVsLiteracy] = useState<ChartData>([]);
  const [agingIdxVsLiteracy, setAgingIdxVsLiteracy] = useState<ChartData>([]);
  const [ageColor, setAgeColor] = useState<ChartData>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAgeVsLiteracy = await fetch(
          "/api/median-age-vs-literacy-by-state"
        );
        if (!resAgeVsLiteracy.ok)
          throw new Error("Failed to fetch median age vs literacy");
        let data: ChartData = await resAgeVsLiteracy.json();
        setAgeVsLiteracy(data);

        const resAgingIndex = await fetch(
          "/api/aging-index-vs-literacy-by-color"
        );
        if (!resAgingIndex.ok)
          throw new Error("Failed to fetch aging index vs literacy");
        data = await resAgingIndex.json();
        setAgingIdxVsLiteracy(data);

        const resAgeColor = await fetch("/api/age-color-proportion");
        if (!resAgeColor.ok)
          throw new Error("Failed to fetch age structure by color");
        data = await resAgeColor.json();
        setAgeColor(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Section secondaryBg id="capitulo-6">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 6</ChapterHeader.Label>
        <ChapterHeader.Title>Desigualdades Visíveis</ChapterHeader.Title>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-xl">Lorem</h3>
            <p className="text-muted-foreground text-xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Doloremque dolorum laboriosam atque
              eum tenetur molestiae tempore, dolor minus rem sapiente natus
              inventore vitae. Totam deserunt eligendi id iusto ea aliquid!
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid!
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border shadow-sm">
            <ScatterPlot
              data={ageVsLiteracy}
              xField="idade_mediana"
              yField="taxa_alfabetizacao"
              xLabel="Idade Mediana"
              yLabel="Taxa de Alfabetização"
              color="#000"
              colorField="nome_regiao"
              colorScheme="Set2"
              title="Taxa de Alfabetização x Idade Mediana por Estado"
              tooltipFields={{
                nome_uf: "Estado",
                nome_regiao: "Região",
                idade_mediana: "Idade Mediana",
                taxa_alfabetizacao: "Taxa de Alfabetização",
              }}
              gridColor="#000"
              gridOpacity={0.1}
              pointSize={100}
            />
          </div>

          <div>
            <h3 className="font-bold text-xl">Lorem</h3>
            <p className="text-muted-foreground text-xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Doloremque dolorum laboriosam atque
              eum tenetur molestiae tempore, dolor minus rem sapiente natus
              inventore vitae. Totam deserunt eligendi id iusto ea aliquid!
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid!
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border shadow-sm">
            <ScatterPlot
              data={agingIdxVsLiteracy}
              xField="indice_envelhecimento"
              yField="taxa_alfabetizacao"
              xLabel="Indice de Envelhecimento"
              yLabel="Taxa de Alfabetização"
              color="#000"
              colorField="cor_raca"
              colorScheme="tableau10"
              title="Indice de Envelhecimento x Taxa de Alfabetização por Cor/Raça"
              tooltipFields={{
                cor_raca: "Cor/Raça",
                indice_envelhecimento: "Índice de Envelhecimento",
                taxa_alfabetizacao: "Taxa de Alfabetização",
              }}
              gridColor="#000"
              gridOpacity={0.1}
              pointSize={160}
            />
          </div>

          <div>
            <h3 className="font-bold text-xl">Lorem</h3>
            <p className="text-muted-foreground text-xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Doloremque dolorum laboriosam atque
              eum tenetur molestiae tempore, dolor minus rem sapiente natus
              inventore vitae. Totam deserunt eligendi id iusto ea aliquid!
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
              dolor minus rem sapiente natus inventore vitae. Totam deserunt
              eligendi id iusto ea aliquid!
            </p>
          </div>

          <div>
            <StackedBarChart
              data={ageColor}
              categoryField="cor_raca"
              valueField="percentual"
              stackField="ciclo_vida"
              horizontal
              colorScheme="tableau10"
              title="Proporção da População por Ciclo de Vida e Cor/Raça"
              xLabel="Porcentagem"
              yLabel="Cor/Raça"
              legendTitle="Ciclo de Vida"
              tooltipFields={{
                cor_raca: "Cor/Raça",
                ciclo_vida: "Ciclo de Vida",
                percentual: "Porcentagem",
              }}
              height={200}
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterSix;
