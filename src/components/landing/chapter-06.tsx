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
        <ChapterHeader.Subtitle>
          O Censo de 2022 mostra que existem grandes diferenças na forma como os
          brasileiros vivem. O acesso a oportunidades, como educação de
          qualidade, não é igual para todos.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-xl">
              O Retrato Regional da Educação
            </h3>
            <p className="text-muted-foreground text-xl">
              O gráfico mostra uma tendência no país: estados com uma população
              mais envelhecida (maior idade mediana) geralmente possuem taxas de
              alfabetização mais altas. Isso é visível no grupo de estados do{" "}
              <span className="text-[#b2d67b]">Sul</span> e{" "}
              <span className="text-[#e0a0c9]">Sudeste</span>, que se concentram
              no canto superior direito do gráfico.
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Já os estados do <span className="text-[#eea285]">Nordeste</span>{" "}
              formam um agrupamento distinto na parte inferior do gráfico. Isso
              revela que eles possuem as taxas de alfabetização mais baixas do
              Brasil, com suas idades medianas variando mais ao centro do eixo
              horizontal. O desafio educacional do Nordeste se destaca pelos
              baixos índices de alfabetização de forma geral, enquanto a
              característica principal do{" "}
              <span className="text-[#a1afce]">Norte</span> é ter uma estrutura
              populacional muito jovem.
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
            <h3 className="font-bold text-xl">
              Educação e Desigualdade Racial
            </h3>
            <p className="text-muted-foreground text-xl">
              No topo da escala de alfabetização, estão as populações Amarela e
              Branca. A população Amarela se posiciona como um ponto fora da
              curva, com o mais alto índice de envelhecimento e a maior taxa de
              alfabetização.
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Embora a população Preta seja, em média, mais velha que a Branca,
              seu nível de alfabetização é mais baixo. Isso mostra que a
              desigualdade histórica no acesso à educação para a população preta
              foi tão impactante que seus efeitos ainda são visíveis hoje,
              quebrando a tendência geral.
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
