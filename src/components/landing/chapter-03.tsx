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
                color={getComputedStyle(
                  document.documentElement
                ).getPropertyValue("--color-muted-foreground")}
                tooltipFields={{
                  idade_grupo: "Faixa Etária",
                  total: "População",
                }}
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
              <ChoroplethMapD3
                data={filteredMapData}
                locationField="nome_uf"
                valueField="porcentagem"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterThree;
