"use client";

import { useState, useEffect, useMemo } from "react";
import MetricCard from "../MetricCard";
import ChapterHeader from "../ui/ChapterHeader";
import Section from "../ui/Section";
import BarChart from "../charts/BarChart";
import { type ChartData } from "@/types/api";
import BidirectionalBarChart from "../charts/BidirectionalBarChart";
import ChoroplethMapD3 from "../charts/ChoroplethMapD3";

const ChapterOne = () => {
  const [popPerAgeGroup, setPopPerAgeGroup] = useState<ChartData>([]);
  const [popPerAgeGroup2022, setPopPerAgeGroup2022] = useState<ChartData>([]);
  const [popPerState, setPopPerState] = useState<ChartData>([]);
  const [popPerSex, setPopPerSex] = useState<ChartData>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAgeGroup = await fetch("/api/population-by-age-group", {
          method: "POST",
          body: JSON.stringify({
            year: 2010,
          }),
        });
        if (!resAgeGroup.ok)
          throw new Error("Failed to fetch population by age group");
        const popAgeGroup = await resAgeGroup.json();
        setPopPerAgeGroup(popAgeGroup);

        const resAgeGroup2022 = await fetch("/api/population-by-age-group", {
          method: "POST",
          body: JSON.stringify({
            year: 2022,
          }),
        });
        if (!resAgeGroup2022.ok)
          throw new Error("Failed to fetch population by age group");
        const popAgeGroup2022 = await resAgeGroup2022.json();
        setPopPerAgeGroup2022(popAgeGroup2022);

        const resState = await fetch("/api/population-distribution-by-state");
        if (!resState.ok)
          throw new Error("Failed to fetch population distribution by state");
        const popState: ChartData = await resState.json();
        console.log("popState:", popState);
        setPopPerState(popState);

        const uniqueAgeGroups = [
          ...new Set(popState.map((d) => d.idade_grupo as string)),
        ];
        setAgeGroups(uniqueAgeGroups);
        if (uniqueAgeGroups.length > 0) {
          setSelectedAgeGroup(uniqueAgeGroups[0]);
        }

        const resSex = await fetch("/api/population-distribution-by-sex");
        if (!resSex.ok)
          throw new Error("Failed to fetch population distribution by sex");
        const popSex = await resSex.json();
        setPopPerSex(popSex);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredMapData = useMemo(() => {
    if (!selectedAgeGroup) return [];
    return popPerState
      .filter((d) => d.idade_grupo === selectedAgeGroup)
      .map((d) => ({
        nome_uf: d.nome_uf,
        populacao_grupo: Number(d.populacao_grupo),
        populacao_estado: Number(d.populacao_estado),
        proporcao: Number(d.proporcao),
      }));
  }, [popPerState, selectedAgeGroup]);

  return (
    <Section id="capitulo-1">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 1</ChapterHeader.Label>
        <ChapterHeader.Title>
          O Retrato da População Brasileira
        </ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          O Censo 2022 desenha um novo perfil para o Brasil, revelando uma
          transformação profunda que vinha acontecendo silenciosamente nas
          últimas décadas. Deixamos para trás aquele estereótipo de &apos;país
          jovem&apos; e entramos de vez numa fase de amadurecimento acelerado.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <MetricCard.Root>
            <MetricCard.Value>203,1</MetricCard.Value>
            <MetricCard.Label>Milhões de Pessoas</MetricCard.Label>
            <MetricCard.Description>
              População total do Brasil em 2022
            </MetricCard.Description>
          </MetricCard.Root>
          <MetricCard.Root>
            <MetricCard.Value>5.570</MetricCard.Value>
            <MetricCard.Label>Municípios</MetricCard.Label>
            {/* <MetricCard.Description>
              Lorem ipsum dolor sit amet
            </MetricCard.Description> */}
          </MetricCard.Root>
          <MetricCard.Root>
            <MetricCard.Value>95</MetricCard.Value>
            <MetricCard.Label>Homens</MetricCard.Label>
            <MetricCard.Description>
              Para cada 100 mulheres
            </MetricCard.Description>
          </MetricCard.Root>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-xl">Faixa Etária</h3>
            <p className="text-muted-foreground text-xl">
              Quando colocamos os dados de{" "}
              <span className="text-deco-emerald font-semibold">2010</span> e{" "}
              <span className="text-deco-emerald font-semibold">2022</span> lado
              a lado, a diferença é gritante e conta a história de uma revolução
              nas famílias brasileiras. Olhe para o topo do gráfico, as{" "}
              <span className="text-[#b4de2c] font-semibold">
                barras esverdeadas
              </span>
              : em apenas 12 anos, a quantidade de crianças e jovens encolheu
              visivelmente. Isso é o reflexo direto de uma decisão que milhões
              de lares tomaram: ter menos filhos.
            </p>
          </div>

          <div>
            <BarChart
              data={popPerAgeGroup}
              categoryField="idade_grupo"
              valueField="total"
              title="População por Faixa Etária (2010)"
              xLabel="População"
              yLabel="Faixa Etária"
              colorField="idade_grupo"
              colorScheme="viridis"
              colorReverse={true}
              horizontal
              tooltipFields={{
                idade_grupo: "Faixa Etária",
                total: "População",
              }}
            />
          </div>

          <div>
            <p className="text-muted-foreground text-xl">
              Por outro lado, a base da pirâmide está &apos;engordando&apos;. O
              Brasil ganhou milhões de novos idosos e adultos de meia-idade
              nesse curto período. Agora, temos uma população adulta
              predominante, pronta para trabalhar, mas que precisa sustentar um
              topo cada vez mais pesado de aposentados, enquanto a base de
              futuros trabalhadores diminui.
            </p>
          </div>

          <div>
            <BarChart
              data={popPerAgeGroup2022}
              categoryField="idade_grupo"
              valueField="total"
              title="População por Faixa Etária (2022)"
              xLabel="População"
              yLabel="Faixa Etária"
              colorField="idade_grupo"
              colorScheme="viridis"
              colorReverse={true}
              horizontal
              tooltipFields={{
                idade_grupo: "Faixa Etária",
                total: "População",
              }}
            />
          </div>

          <div>
            <h3 className="font-bold text-xl">Distribuição Geográfica</h3>
            <p className="text-muted-foreground text-xl">
              O Brasil é um país de tamanho continental, e isso se reflete
              também na idade da sua população: não envelhecemos todos no mesmo
              ritmo. Se olharmos para o Norte, especialmente estados como
              Roraima e Amazonas, ainda vê um Brasil muito jovem, onde as
              crianças e adolescentes são uma parte enorme da população,
              demandando mais escolas e creches.
            </p>
            <br />
            <p className="text-muted-foreground text-xl">
              Já quando descemos para o Sul e Sudeste, o cenário muda
              completamente. Estados como o Rio Grande do Sul e Rio de Janeiro
              lideram o envelhecimento nacional, com uma proporção de idosos
              muito maior. Ao usar o filtro ao lado, você consegue ver essa
              &apos;mancha demográfica&apos; se movendo pelo mapa. É fascinante
              perceber como as demandas públicas mudam de estado para estado:
              enquanto uns ainda precisam focar na educação básica para uma
              juventude numerosa, outros já precisam correr para adaptar seus
              sistemas de saúde para cuidar de uma população idosa crescente.
            </p>
          </div>

          <div>
            <div className="flex flex-col items-center">
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="mb-4 p-2 border rounded text-foreground"
              >
                {ageGroups.map((group) => (
                  <option
                    key={group}
                    value={group}
                    className="checked:font-semibold text-deco-navy"
                  >
                    {group}
                  </option>
                ))}
              </select>
              <ChoroplethMapD3
                data={filteredMapData}
                locationField="nome_uf"
                valueField="proporcao"
                colorScheme="blues"
                tooltipFields={{
                  // nome_uf: "Estado",
                  populacao_grupo: "População da Faixa Etária",
                  populacao_estado: "Total de Habitantes",
                  proporcao: "Porcentagem",
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl">
              Composição por Sexo (
              <span className="text-[#6baed6]">Homens</span> vs.{" "}
              <span className="text-[#fd8d3c]">Mulheres</span>)
            </h3>
            <p className="text-muted-foreground text-xl">
              Aqui temos uma dinâmica curiosa da natureza e da sociedade.
              Biologicamente, nascem mais meninos do que meninas no Brasil, é um
              padrão quase constante. Porém, ao longo da vida, essa balança vai
              se invertendo de forma dramática. Os homens morrem muito mais cedo
              e em maior quantidade, principalmente na juventude, vítimas de
              causas externas como violência e acidentes de trânsito. As
              mulheres, além de se exporem menos a esses riscos, tendem a cuidar
              mais da própria saúde, garantindo uma longevidade maior. O
              resultado disso vemos claramente no topo do gráfico: a terceira
              idade no Brasil é feminina. Quanto mais a idade avança, maior é a
              diferença. Em muitas cidades, já existe um desequilíbrio grande,
              onde há muito mais mulheres idosas vivendo sozinhas ou chefiando
              famílias do que homens na mesma faixa etária.
            </p>
          </div>

          <div>
            <BidirectionalBarChart
              data={popPerSex}
              valueField="total"
              categoryField="idade_grupo"
              colorField="sexo"
              xLabel="População"
              yLabel="Faixa Etária"
              tooltipFields={{
                idade_grupo: "Faixa Etária",
                sexo: "Sexo",
                total: "População",
              }}
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterOne;
