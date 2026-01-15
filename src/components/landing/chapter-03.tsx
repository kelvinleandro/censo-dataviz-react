"use client";

import { ChartData } from "@/types/api";
import { useState, useEffect, useMemo } from "react";
import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";
import Treemap from "../charts/Treemap";
import ChoroplethMapD3 from "../charts/ChoroplethMapD3";
import BarChart from "../charts/BarChart";

const ChapterThree = () => {
  const [popColor, setPopColor] = useState<ChartData>([]);
  const [popColorAge, setPopColorAge] = useState<ChartData>([]);
  const [popColorState, setPopColorState] = useState<ChartData>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resColor = await fetch("/api/population-by-race");
        if (!resColor.ok) throw new Error("Failed to fetch population by race");
        let data: ChartData = await resColor.json();
        setPopColor(data);

        const resAge = await fetch("/api/race-distribution-by-age-group");
        if (!resAge.ok)
          throw new Error("Failed to fetch race distribution by age group");
        data = await resAge.json();
        setPopColorAge(data);

        const resState = await fetch("/api/state-diversity");
        if (!resState.ok) throw new Error("Failed to fetch state diversity");
        data = await resState.json();
        setPopColorState(data);

        const uniqueColors = [
          ...new Set(data.map((d) => d.cor_raca as string)),
        ];
        setColors(uniqueColors);
        if (uniqueColors.length > 0) {
          setSelectedColor(uniqueColors[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredMapData = useMemo(() => {
    if (!selectedColor) return [];
    return popColorState
      .filter((d) => d.cor_raca === selectedColor)
      .map((d) => ({
        cor_raca: d.cor_raca,
        nome_uf: d.nome_uf,
        total: Number(d.total),
        porcentagem: Number(d.porcentagem),
      }));
  }, [popColorState, selectedColor]);

  const filteredBarChartData = useMemo(() => {
    if (!selectedColor) return [];
    return popColorAge
      .filter((d) => d.cor_raca === selectedColor)
      .map((d) => ({
        cor_raca: d.cor_raca,
        idade_grupo: d.idade_grupo,
        total: Number(d.total),
        porcentagem_na_idade: Number(d.porcentagem_na_idade),
      }));
  }, [popColorAge, selectedColor]);

  const treemapTooltipFields = useMemo(
    () => ({
      "Cor/Raça": "datum['cor_raca']",
      População: "format(datum['total'], ',.0f')",
      Porcentagem: "datum['porcentagem']",
    }),
    []
  );

  return (
    <Section id="capitulo-3">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 3</ChapterHeader.Label>
        <ChapterHeader.Title>As Cores do Território</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          O Censo 2022 marca uma virada histórica: pela primeira vez desde o
          início da série histórica, a população parda se torna o maior grupo
          racial do Brasil. Este capítulo explora como a autodeclaração reflete
          nossa ancestralidade e como essa diversidade se distribui por gerações
          e fronteiras.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-xl">O Retrato da Autodeclaração</h3>
            <p className="text-muted-foreground text-xl">
              O Brasil mudou de cor. Em 2022, cerca de 92,1 milhões de pessoas
              se declararam <span className="text-[#72b7b2]">pardas</span>,
              representando 45,3% da população e ultrapassando, pela primeira
              vez, o grupo de pessoas{" "}
              <span className="text-[#f58518]">brancas</span>
              (43,5%).
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Essa mudança não se deve apenas à demografia, mas também a um novo
              olhar sobre a identidade. Houve um crescimento expressivo na
              autodeclaração de pessoas{" "}
              <span className="text-[#54a24b]">pretas</span> (que saltaram para
              10,2%) e <span className="text-[#e45756]">indígenas</span>,
              refletindo um processo de resgate de origens e afirmação racial
              que reconfigura as estatísticas oficiais do país.
            </p>
          </div>

          <div>
            {popColor.length > 0 && (
              <Treemap
                data={popColor}
                valueField="total"
                categoryField="cor_raca"
                // title="Distribuição da População por Cor/Raça"
                tooltipFields={treemapTooltipFields}
              />
            )}
          </div>

          <div>
            <h3 className="font-bold text-xl">
              O Perfil Etário de Cada Cor/Raça
            </h3>
            <p className="text-muted-foreground text-xl">
              Ao selecionar diferentes grupos ao lado, notamos que o Brasil vive
              tempos demográficos distintos simultaneamente. A população
              Indígena e Parda mantém o desenho clássico de pirâmide: uma base
              larga de <span className="text-[#b4de2c]">crianças e jovens</span>{" "}
              que sustenta a estrutura, indicando taxas de natalidade mais altas
              e uma população majoritariamente jovem.
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Já entre as pessoas Brancas, Amarelas e Pretas, notamos um claro
              estreitamento da base. O número de crianças (0 a 14 anos)
              tornou-se menor que o de
              <span className="text-[#1f9d89]">adultos</span> (especialmente
              entre 25 e 44 anos). Isso cria uma estrutura onde o maior volume
              populacional se concentra na idade ativa, evidenciando a queda na
              fecundidade antes mesmo de um aumento expressivo na proporção de
              idosos no topo
            </p>
          </div>

          <div>
            <div className="flex flex-col items-center">
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="mb-4 p-2 border rounded text-foreground"
              >
                {colors.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className="checked:font-semibold text-deco-navy"
                  >
                    {c}
                  </option>
                ))}
              </select>
              <BarChart
                data={filteredBarChartData}
                categoryField="idade_grupo"
                valueField="total"
                horizontal
                tooltipFields={{
                  idade_grupo: "Faixa Etária",
                  total: "População",
                }}
                colorField="idade_grupo"
                colorScheme="viridis"
                colorReverse
                title={`Estrutura Etária: População ${selectedColor}`}
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl">A Geografia da Diversidade</h3>
            <p className="text-muted-foreground text-xl">
              O mapa do Brasil não é uniforme; ele reflete séculos de fluxos
              migratórios e colonização. Ao explorar os dados, vemos que o Norte
              se consolida como o grande território das identidades Parda e
              Indígena, onde a presença dos povos originários e a miscigenação
              na Amazônia são predominantes.
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Já o Sul e parte do Sudeste permanecem como os redutos da
              população Branca, reflexo da imigração europeia. O Nordeste, por
              sua vez, conta outra história: é a região onde a soma de pretos e
              pardos é mais expressiva. O destaque vai para a Bahia, que aparece
              no mapa com a cor mais intensa para a população Preta, reafirmando
              seu papel central na herança africana do país.
            </p>
          </div>

          <div>
            <div className="flex flex-col items-center justify-center">
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="mb-4 p-2 border rounded text-foreground"
              >
                {colors.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className="checked:font-semibold text-deco-navy"
                  >
                    {c}
                  </option>
                ))}
              </select>
              <h3 className="text-xl font-bold text-center mb-4">
                {`Proporção (%) da População ${selectedColor} por UF`}
              </h3>
              <ChoroplethMapD3
                width={650}
                height={450}
                data={filteredMapData}
                locationField="nome_uf"
                valueField="porcentagem"
                tooltipFields={{
                  total: "População do grupo",
                  porcentagem: "Porcentagem",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterThree;
