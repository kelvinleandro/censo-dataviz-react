"use client";

import { useState, useEffect } from "react";
import MetricCard from "../MetricCard";
import ChapterHeader from "../ui/ChapterHeader";
import Section from "../ui/Section";
import BarChart from "../charts/BarChart";
import { type ChartData } from "@/types/api";
import BidirectionalBarChart from "../charts/BidirectionalBarChart";

const ChapterOne = () => {
  const [popPerAgeGroup, setPopPerAgeGroup] = useState<ChartData>([]);
  const [popPerState, setPopPerState] = useState<ChartData>([]);
  const [popPerSex, setPopPerSex] = useState<ChartData>([]);
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
        const popState = await resState.json();
        setPopPerState(popState);

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
            <MetricCard.Value>203,1</MetricCard.Value>
            <MetricCard.Label>Milhões de Pessoas</MetricCard.Label>
            <MetricCard.Description>
              Lorem ipsum dolor sit amet
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

          <div>(ToDo!)</div>
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
