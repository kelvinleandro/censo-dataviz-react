"use client";

import { ChartData } from "@/types/api";
import { useState, useEffect, useRef } from "react";
import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";
import * as d3 from "d3";

const ChapterTwo = () => {
  // data
  const [raceData, setRaceData] = useState<ChartData>([]);
  const [indigenousData, setIndigenousData] = useState<ChartData>([]);
  const [quilombolaData, setQuilombolaData] = useState<ChartData>([]);

  // handling transition between charts
  const svgRef = useRef<SVGSVGElement | null>(null);
  const trigger1Ref = useRef<HTMLDivElement | null>(null);
  const trigger2Ref = useRef<HTMLDivElement | null>(null);
  const trigger3Ref = useRef<HTMLDivElement | null>(null);
  const svgContainer = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRace = await fetch("/api/population-by-race");
        if (!resRace.ok) throw new Error("Failed to fetch population by race");
        const rawRace = await resRace.json();
        setRaceData(
          rawRace.map((d: any) => ({
            category: d.cor_raca,
            value: Number(d.porcentagem),
          }))
        );

        const resIndigenous = await fetch(
          "/api/indigenous-population-by-state"
        );
        if (!resIndigenous.ok)
          throw new Error("Failed to fetch indigenous data");
        const rawInd = await resIndigenous.json();
        const top10Ind = rawInd
          .sort((a: any, b: any) => Number(b.total) - Number(a.total))
          .slice(0, 10);
        setIndigenousData(
          top10Ind.map((d: any) => ({
            category: d.nome_uf,
            value: Number(d.total),
          }))
        );

        const resQuilombola = await fetch(
          "/api/quilombola-population-by-state"
        );
        if (!resQuilombola.ok)
          throw new Error("Failed to fetch quilombola data");
        const rawQuilo = await resQuilombola.json();
        const top10Quilo = rawQuilo
          .sort((a: any, b: any) => Number(b.total) - Number(a.total))
          .slice(0, 10);
        setQuilombolaData(
          top10Quilo.map((d: any) => ({
            category: d.nome_uf,
            value: Number(d.total),
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      !svgRef.current ||
      raceData.length === 0 ||
      indigenousData.length === 0 ||
      quilombolaData.length === 0
    ) {
      return;
    }

    const margin = { top: 20, right: 50, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    if (!svgContainer.current) {
      const svg = d3
        .select(svgRef.current)
        .attr(
          "viewBox",
          `0 0 ${width + margin.left + margin.right} ${
            height + margin.top + margin.bottom
          }`
        )
        .style("width", "100%")
        .style("height", "auto");

      svgContainer.current = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .node();

      const g = d3.select(svgContainer.current);
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);
      g.append("g").attr("class", "y-axis");
    }

    const g = d3.select(svgContainer.current);

    const update = (
      data: ChartData,
      orientation: "horizontal" | "vertical",
      formatType: "percent" | "number"
    ) => {
      const sortedData: ChartData = [...data].sort(
        (a, b) =>
          Number(a.value) - Number(b.value) ||
          (a.category as string).localeCompare(b.category as string)
      );

      const formatLabel = (val: number) =>
        formatType === "percent"
          ? `${val.toFixed(1)}%`
          : val.toLocaleString("pt-BR", { notation: "compact" });

      if (orientation === "horizontal") {
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([height, 0]).padding(0.1);

        x.domain([0, d3.max(sortedData, (d) => d.value as number) ?? 100]);
        y.domain(sortedData.map((d) => d.category as string));

        g.select<SVGGElement>(".x-axis")
          .transition()
          .duration(1000)
          .call(
            d3
              .axisBottom(x)
              .ticks(5)
              .tickFormat((d) =>
                formatType === "percent"
                  ? `${d}%`
                  : d3.format(".2s")(d as number)
              )
          );

        g.select<SVGGElement>(".y-axis")
          .transition()
          .duration(1000)
          .call(d3.axisLeft(y).tickSizeOuter(0));

        const bars = g
          .selectAll<SVGRectElement, (typeof sortedData)[0]>(".bar")
          .data(sortedData, (d) => d.category);

        bars
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => y(d.category as string) as number)
          .attr("height", y.bandwidth())
          .attr("x", 0)
          .attr("width", 0)
          .attr("fill", "steelblue")
          .merge(bars)
          .transition()
          .duration(1000)
          .attr("y", (d) => y(d.category as string) as number)
          .attr("width", (d) => x(d.value as number))
          .attr("height", y.bandwidth())
          .attr("fill", "steelblue");

        bars.exit().transition().duration(1000).attr("width", 0).remove();

        const barLabels = g
          .selectAll<SVGTextElement, (typeof sortedData)[0]>("text.bar-label")
          .data(sortedData, (d) => d.category);

        barLabels.exit().transition().duration(500).attr("opacity", 0).remove();

        barLabels
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("fill", "white")
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .attr("dy", "0.35em")
          .attr("opacity", 0)
          .merge(barLabels)
          .transition()
          .duration(1000)
          .delay(250)
          .attr("opacity", 1)
          .attr("x", (d) => x(d.value as number) - 5)
          .attr(
            "y",
            (d) => (y(d.category as string) as number) + y.bandwidth() / 2
          )
          .textTween(function (d) {
            const currentVal = parseFloat(
              this.textContent?.replace(/[^\d.-]/g, "") || "0"
            );
            const i = d3.interpolate(currentVal, d.value as number);
            return function (t) {
              return formatLabel(i(t));
            };
          });
      } else {
        const x = d3.scaleBand().range([0, width]).padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);
        const color = d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(data.map((d) => d.category as string));

        x.domain(sortedData.map((d) => d.category as string));
        y.domain([0, d3.max(sortedData, (d) => d.value as number) ?? 100]);

        g.select<SVGGElement>(".x-axis")
          .transition()
          .duration(1000)
          .call(d3.axisBottom(x).tickSizeOuter(0));

        g.select<SVGGElement>(".y-axis")
          .transition()
          .duration(1000)
          .call(
            d3
              .axisLeft(y)
              .ticks(5)
              .tickFormat((d) =>
                formatType === "percent"
                  ? `${d}%`
                  : d3.format(".2s")(d as number)
              )
          );

        const bars = g
          .selectAll<SVGRectElement, (typeof sortedData)[0]>(".bar")
          .data(sortedData, (d) => d.category);

        bars
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.category as string) as number)
          .attr("width", x.bandwidth())
          .attr("y", height)
          .attr("height", 0)
          .attr("fill", (d) => color(d.category as string))
          .merge(bars)
          .transition()
          .duration(1000)
          .attr("x", (d) => x(d.category as string) as number)
          .attr("y", (d) => y(d.value as number))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.value as number))
          .attr("fill", (d) => color(d.category as string));

        bars
          .exit()
          .transition()
          .duration(1000)
          .attr("y", height)
          .attr("height", 0)
          .remove();

        const barLabels = g
          .selectAll<SVGTextElement, (typeof sortedData)[0]>("text.bar-label")
          .data(sortedData, (d) => d.category);

        barLabels.exit().transition().duration(500).attr("opacity", 0).remove();

        barLabels
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .attr("dy", "0.35em")
          .attr("opacity", 0)
          .merge(barLabels)
          .transition()
          .duration(1000)
          .delay(250)
          .attr("opacity", 1)
          .attr(
            "x",
            (d) => (x(d.category as string) as number) + x.bandwidth() / 2
          )
          .attr("y", (d) => (y(d.value as number) + height) / 2)
          .textTween(function (d) {
            const currentVal = parseFloat(
              this.textContent?.replace(/[^\d.-]/g, "") || "0"
            );
            const i = d3.interpolate(currentVal, d.value as number);
            return function (t) {
              return formatLabel(i(t));
            };
          });
      }
    };

    update(raceData, "vertical", "percent");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === trigger1Ref.current) {
              update(raceData, "vertical", "percent");
            } else if (entry.target === trigger2Ref.current) {
              update(indigenousData, "horizontal", "number");
            } else if (entry.target === trigger3Ref.current) {
              update(quilombolaData, "horizontal", "number");
            }
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const currentTrigger1 = trigger1Ref.current;
    const currentTrigger2 = trigger2Ref.current;
    const currentTrigger3 = trigger3Ref.current;

    if (currentTrigger1) observer.observe(currentTrigger1);
    if (currentTrigger2) observer.observe(currentTrigger2);
    if (currentTrigger3) observer.observe(currentTrigger3);

    return () => {
      if (currentTrigger1) observer.unobserve(currentTrigger1);
      if (currentTrigger2) observer.unobserve(currentTrigger2);
      if (currentTrigger3) observer.unobserve(currentTrigger3);
    };
  }, [raceData, indigenousData, quilombolaData]);

  return (
    <Section secondaryBg>
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 2</ChapterHeader.Label>
        <ChapterHeader.Title>
          Diversidade no Brasil: Raça e Povos Tradicionais
        </ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perspiciatis
          reprehenderit dolorem expedita tenetur inventore dolor facilis ex
          voluptates hic omnis, similique quo quibusdam consequuntur doloribus
          tempora qui. Esse, commodi non.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <div className="flex items-start">
          <div className="w-[65%] sticky top-[25vh]">
            <div className="flex justify-center">
              <svg ref={svgRef}></svg>
            </div>
          </div>

          <div className="flex-1">
            <div ref={trigger1Ref} className="h-[70vh] pt-[15vh]">
              <h3 className="text-xl font-bold mb-2 text-deco-emerald">
                Autodeclaração Racial
              </h3>
              <p className="text-muted-foreground">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam
                earum ad, minima sunt, et provident suscipit dignissimos fuga
                hic ab pariatur illo vitae consequuntur ipsa sequi maiores
                voluptas laudantium porro.
              </p>
            </div>

            <div ref={trigger2Ref} className="h-[70vh] pt-[15vh]">
              <h3 className="text-xl font-bold mb-2 text-deco-emerald">
                Povos Indígenas
              </h3>
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Commodi officiis quia modi quisquam cupiditate repellat mollitia
                minus tempore accusamus consequatur. Quidem soluta cum optio.
                Quasi voluptas nam reprehenderit facere vel!
              </p>
            </div>

            <div ref={trigger3Ref} className="h-[70vh] pt-[15vh]">
              <h3 className="text-xl font-bold mb-2 text-deco-emerald">
                População Quilombola
              </h3>
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Doloremque, impedit mollitia inventore accusamus modi autem,
                atque quae quos rem, ad voluptas repellendus molestiae
                recusandae quis cupiditate perspiciatis vero ullam fuga?
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterTwo;
