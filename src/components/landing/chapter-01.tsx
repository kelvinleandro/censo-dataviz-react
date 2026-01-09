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
  const [popPerState, setPopPerState] = useState<ChartData>([]);
  const [popPerSex, setPopPerSex] = useState<ChartData>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAgeGroup = await fetch("/api/population-by-age-group");
        if (!resAgeGroup.ok)
          throw new Error("Failed to fetch population by age group");
        const popAgeGroup = await resAgeGroup.json();
        setPopPerAgeGroup(popAgeGroup);

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
        proporcao: Number(d.proporcao),
      }));
  }, [popPerState, selectedAgeGroup]);

  return (
    <Section>
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 1</ChapterHeader.Label>
        <ChapterHeader.Title>
          O Retrato da População Brasileira
        </ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit.
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
          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
            dolorum laboriosam atque eum tenetur molestiae tempore, dolor minus
            rem sapiente natus inventore vitae. Totam deserunt eligendi id iusto
            ea aliquid! Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
            dolor minus rem sapiente natus inventore vitae. Totam deserunt
            eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Doloremque dolorum laboriosam atque eum tenetur
            molestiae tempore, dolor minus rem sapiente natus inventore vitae.
            Totam deserunt eligendi id iusto ea aliquid!
          </p>

          <div>
            <BarChart
              data={popPerAgeGroup}
              categoryField="idade_grupo"
              valueField="total"
              title="População por Faixa Etária"
              xLabel="População"
              yLabel="Faixa Etária"
              color={getComputedStyle(
                document.documentElement
              ).getPropertyValue("--color-muted-foreground")}
              horizontal
            />
          </div>

          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
            dolorum laboriosam atque eum tenetur molestiae tempore, dolor minus
            rem sapiente natus inventore vitae. Totam deserunt eligendi id iusto
            ea aliquid! Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
            dolor minus rem sapiente natus inventore vitae. Totam deserunt
            eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Doloremque dolorum laboriosam atque eum tenetur
            molestiae tempore, dolor minus rem sapiente natus inventore vitae.
            Totam deserunt eligendi id iusto ea aliquid!
          </p>

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
              />
            </div>
          </div>
          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
            dolorum laboriosam atque eum tenetur molestiae tempore, dolor minus
            rem sapiente natus inventore vitae. Totam deserunt eligendi id iusto
            ea aliquid! Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Doloremque dolorum laboriosam atque eum tenetur molestiae tempore,
            dolor minus rem sapiente natus inventore vitae. Totam deserunt
            eligendi id iusto ea aliquid! Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Doloremque dolorum laboriosam atque eum tenetur
            molestiae tempore, dolor minus rem sapiente natus inventore vitae.
            Totam deserunt eligendi id iusto ea aliquid!
          </p>

          <div>
            <BidirectionalBarChart
              data={popPerSex}
              valueField="total"
              categoryField="idade_grupo"
              colorField="sexo"
              xLabel="População"
              yLabel="Faixa Etária"
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterOne;
