/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { type FeatureCollection, type Feature } from "geojson";
import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";

const normalize = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

interface IndigenousData {
  nome_uf: string;
  total: number;
  porcentagem: number;
  em_terra_indigena?: number;
  total_indigena?: number;
}

interface QuilombolaData {
  nome_uf: string;
  total: number;
  porcentagem: number;
}

interface TerritoryRawData {
  nome_uf: string;
  em_terra_indigena: number;
  total_indigena: number;
}

type BrazilStateFeature = Feature & {
  properties: { [key: string]: any };
};

const ChapterFive = () => {
  const [indigenousData, setIndigenousData] = useState<IndigenousData[]>([]);
  const [quilombolaData, setQuilombolaData] = useState<QuilombolaData[]>([]);

  const indigenousRef = useRef<IndigenousData[]>([]);
  const quilombolaRef = useRef<QuilombolaData[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const geoJsonCache = useRef<FeatureCollection | null>(null);
  const svgContainer = useRef<SVGGElement | null>(null);

  const trigger1Ref = useRef<HTMLDivElement | null>(null);
  const trigger2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    indigenousRef.current = indigenousData;
  }, [indigenousData]);
  useEffect(() => {
    quilombolaRef.current = quilombolaData;
  }, [quilombolaData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTerritories = await fetch("/api/territories-vs-residents");
        const territoriesData: TerritoryRawData[] = await resTerritories.json();
        const territoryMap = new Map(
          territoriesData.map((d) => [normalize(d.nome_uf), d])
        );

        const resInd = await fetch("/api/indigenous-population-by-state");
        const rawInd = await resInd.json();

        const mergedIndigenous = rawInd.map((d: any) => {
          const terrInfo = territoryMap.get(normalize(d.nome_uf));
          return {
            nome_uf: d.nome_uf,
            total: Number(d.total || 0),
            porcentagem: Number(d.porcentagem || 0),
            em_terra_indigena: terrInfo
              ? Number(terrInfo.em_terra_indigena)
              : 0,
            total_indigena: terrInfo ? Number(terrInfo.total_indigena) : 0,
          };
        });
        setIndigenousData(mergedIndigenous);

        const resQuilo = await fetch("/api/quilombola-population-by-state");
        const rawQuilo = await resQuilo.json();
        setQuilombolaData(
          rawQuilo.map((d: any) => ({
            nome_uf: d.nome_uf,
            total: Number(d.total || 0),
            porcentagem: Number(d.porcentagem || 0),
          }))
        );
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);

  const updateMap = (type: "indigenous" | "quilombola") => {
    if (!svgContainer.current) return;
    const g = d3.select(svgContainer.current);

    const tooltip = d3.select("#chapter5-global-tooltip");

    const isIndigenous = type === "indigenous";
    const currentData = isIndigenous
      ? indigenousRef.current
      : quilombolaRef.current;

    if (!currentData || currentData.length === 0) return;

    const color = isIndigenous ? "#059669" : "#7c3aed";
    const dataMap = new Map(currentData.map((d) => [normalize(d.nome_uf), d]));
    const maxVal = d3.max(currentData, (d) => d.total) || 0;
    const sizeScale = d3.scaleSqrt().domain([0, maxVal]).range([0, 45]);

    g.selectAll<SVGCircleElement, BrazilStateFeature>(".bubble")
      .transition()
      .duration(1000)
      .attr("r", (d) => {
        const name = d.properties.name || d.properties.nome || "";
        const stateData = dataMap.get(normalize(name));
        return stateData ? sizeScale(stateData.total) : 0;
      })
      .attr("fill", color);

    g.selectAll<SVGCircleElement, BrazilStateFeature>(".bubble")
      .on("mouseover", function (event, d) {
        const name = d.properties.name || d.properties.nome || "";
        const stateData = dataMap.get(normalize(name));

        if (stateData) {
          d3.select(this)
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .attr("fill-opacity", 0.9);

          const totalFmt = (stateData.total || 0).toLocaleString("pt-BR");
          const pctUf = (stateData.porcentagem || 0).toFixed(2);

          let htmlContent = `
            <div style="font-weight: bold; font-size: 16px; color: #1e293b; margin-bottom: 4px;">${stateData.nome_uf}</div>
            <div style="font-size: 14px; color: #334155;">População: <span style="font-weight: bold;">${totalFmt}</span></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Representa <strong>${pctUf}%</strong> da população do estado</div>
          `;

          if (isIndigenous) {
            const indData = stateData as IndigenousData;
            const emTerra = Number(indData.em_terra_indigena || 0);
            const total = Number(indData.total || 1);
            const pctTerraVal = (emTerra / total) * 100;
            const pctTerra = isNaN(pctTerraVal)
              ? "0.0"
              : pctTerraVal.toFixed(1);
            const emTerraFmt = emTerra.toLocaleString("pt-BR");

            htmlContent += `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Vivem em Terras Indígenas</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="height: 8px; flex: 1; background-color: #f1f5f9; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="height: 100%; background-color: #10b981; width: ${pctTerra}%;"></div>
                  </div>
                  <span style="font-size: 12px; font-weight: bold; color: #059669;">${pctTerra}%</span>
                </div>
                <div style="font-size: 10px; color: #64748b; text-align: right; margin-top: 2px;">
                  (${emTerraFmt} pessoas)
                </div>
              </div>
            `;
          }

          tooltip
            .style("opacity", 1)
            .html(htmlContent)
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px");
        }
      })
      .on("mousemove", function (event) {
        d3.select("#chapter5-global-tooltip")
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("fill-opacity", 0.6);
        d3.select("#chapter5-global-tooltip").style("opacity", 0);
      });
  };

  useEffect(() => {
    const existingTooltip = d3.select("#chapter5-global-tooltip");
    if (existingTooltip.empty()) {
      d3.select("body")
        .append("div")
        .attr("id", "chapter5-global-tooltip")
        .style("position", "absolute")
        .style("z-index", "99999")
        .style("background-color", "white")
        .style("padding", "12px")
        .style("border-radius", "8px")
        .style("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
        .style("border", "1px solid #e2e8f0")
        .style("pointer-events", "none")
        .style("opacity", "0")
        .style("transition", "opacity 0.2s")
        .style("max-width", "250px");
    }

    if (!svgRef.current) return;
    const width = 600;
    const height = 600;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");
    const projection = d3
      .geoMercator()
      .scale(700)
      .center([-52, -15])
      .translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    async function drawBaseMap() {
      if (!svgContainer.current) svgContainer.current = svg.append("g").node();
      const g = d3.select(svgContainer.current);

      if (!geoJsonCache.current) {
        try {
          geoJsonCache.current = (await d3.json(
            "/brazil-states.geojson"
          )) as FeatureCollection;
        } catch (error) {
          console.error("Error GeoJSON:", error);
          return;
        }
      }

      if (g.selectAll(".state").empty()) {
        g.selectAll(".state")
          .data(geoJsonCache.current.features)
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("d", pathGenerator as any)
          .attr("stroke", "#ffffff")
          .attr("fill", "#e2e8f0");
        g.selectAll(".bubble")
          .data(geoJsonCache.current.features)
          .enter()
          .append("circle")
          .attr("class", "bubble")
          .attr("cx", (d) => projection(d3.geoCentroid(d as any))![0])
          .attr("cy", (d) => projection(d3.geoCentroid(d as any))![1])
          .attr("r", 0)
          .attr("fill-opacity", 0.6)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      }
      setupObserver();
      if (indigenousRef.current.length > 0) updateMap("indigenous");
    }

    drawBaseMap();

    return () => {
      d3.select("#chapter5-global-tooltip").remove();
    };
  }, []);

  const setupObserver = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === trigger1Ref.current) updateMap("indigenous");
            else if (entry.target === trigger2Ref.current)
              updateMap("quilombola");
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    if (trigger1Ref.current) observer.observe(trigger1Ref.current);
    if (trigger2Ref.current) observer.observe(trigger2Ref.current);
  };

  useEffect(() => {
    if (indigenousData.length > 0 && svgContainer.current)
      setTimeout(() => updateMap("indigenous"), 500);
  }, [indigenousData]);

  return (
    <Section id="capitulo-5">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 5</ChapterHeader.Label>
        <ChapterHeader.Title>Povos Tradicionais no Mapa</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          O Brasil possui quase <strong>1,7 milhão de indígenas</strong>. O mapa
          revela uma forte concentração na região Norte, especialmente no
          Amazonas{" "}
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="w-full lg:w-[60%] sticky top-[15vh]">
            <div className="relative border rounded-2xl bg-white/50 p-4 shadow-xs">
              <svg ref={svgRef}></svg>
            </div>
          </div>
          <div className="w-full lg:w-[40%] pl-0 lg:pl-4">
            <div
              ref={trigger1Ref}
              className="h-[80vh] flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold mb-4 text-emerald-600">
                População Indígena
              </h3>
              <p className="text-xl">
                Um dado crucial é a relação com a terra: em Amazonas, por exemplo, 30.4% vive em {" "}
                <strong>Terras Indígenas</strong> oficialmente delimitadas em
                cada estado.
              </p>
            </div>
            <div
              ref={trigger2Ref}
              className="h-[80vh] flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold mb-4 text-violet-600">
                População Quilombola
              </h3>
              <p className="text-xl">
                O centro de gravidade se desloca para o{" "}
                <strong>Nordeste</strong>. A Bahia e o Maranhão concentram as
                maiores populações, refletindo a geografia histórica da
                resistência e a formação dos quilombos no país.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
export default ChapterFive;
