"use client";

import { ChartData } from "@/types/api";
import { useState, useEffect, useRef } from "react";
import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";
import * as d3 from "d3";

const ChapterFour = () => {
  // data
  const [literacyRace, setLiteracyRace] = useState<ChartData>([]);
  const [literacyAge, setLiteracyAge] = useState<ChartData>([]);
  const [literacySex, setLiteracySex] = useState<ChartData>([]);

  // handling transition between charts
  const svgRef = useRef<SVGSVGElement | null>(null);
  const trigger1Ref = useRef<HTMLDivElement | null>(null);
  const trigger2Ref = useRef<HTMLDivElement | null>(null);
  const trigger3Ref = useRef<HTMLDivElement | null>(null);
  const svgContainer = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLiteracyRace = await fetch("/api/literacy-rate-by-race");
        if (!resLiteracyRace.ok)
          throw new Error("Failed to fetch literacy rate by race");
        let data: ChartData = await resLiteracyRace.json();
        setLiteracyRace(
          data.map((d) => ({
            category: d.cor_raca,
            value: Number(d.taxa_alfabetizacao),
          }))
        );

        const resLiteracyAge = await fetch("/api/literacy-by-age-group");
        if (!resLiteracyAge.ok)
          throw new Error("Failed to fetch literacy by age group");
        data = await resLiteracyAge.json();
        setLiteracyAge(
          data.map((d) => ({
            category: d.grupo_idade,
            value: Number(d.taxa_alfabetizacao),
          }))
        );

        const resSex = await fetch("/api/literacy-by-sex");
        if (!resSex.ok) throw new Error("Failed to fetch literacy by sex");
        data = await resSex.json();
        setLiteracySex(
          data.map((d) => ({
            category: d.sexo,
            value: Number(d.taxa_percentual),
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
      literacyRace.length === 0 ||
      literacyAge.length === 0 ||
      literacySex.length === 0
    ) {
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
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
      orientation: "horizontal" | "vertical" = "horizontal"
    ) => {
      const sortedData: ChartData = [...data].sort(
        (a, b) =>
          Number(a.value) - Number(b.value) ||
          (a.category as string).localeCompare(b.category as string)
      );

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
              .tickFormat((d) => `${d}%`)
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
          .attr(
            "y",
            (d) => (y(d.category as string) as number) + y.bandwidth() / 2
          )
          .attr("x", (d) => x(d.value as number) - 5)
          .text((d) => `${(d.value as number).toFixed(1)}%`)
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
            const i = d3.interpolate(
              Number(this.textContent?.replace("%", "")) || 0,
              d.value as number
            );
            return function (t) {
              return `${i(t).toFixed(1)}%`;
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
              .tickFormat((d) => `${d}%`)
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
          .attr("fill", (d) => color(d.categorycurrentT as string))
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
          .attr(
            "x",
            (d) => (x(d.category as string) as number) + x.bandwidth() / 2
          )
          .attr("y", (d) => (y(d.value as number) + height) / 2)
          .text((d) => `${(d.value as number).toFixed(1)}%`)
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
            const i = d3.interpolate(
              Number(this.textContent?.replace("%", "")) || 0,
              d.value as number
            );
            return function (t) {
              return `${i(t).toFixed(1)}%`;
            };
          });
      }
    };

    update(literacyRace);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === trigger1Ref.current) {
              update(literacyRace, "horizontal");
            } else if (entry.target === trigger2Ref.current) {
              update(literacyAge, "horizontal");
            } else if (entry.target === trigger3Ref.current) {
              update(literacySex, "vertical");
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
  }, [literacyRace, literacyAge, literacySex]);

  return (
    <Section secondaryBg id="capitulo-4">
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 4</ChapterHeader.Label>
        <ChapterHeader.Title>Alfabetização e Ciclo da Vida</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          A educação é um direito fundamental, mas os dados mostram que o acesso
          ainda não é universal. A taxa de analfabetismo caiu para 7,0% em 2022,
          mas as desigualdades de raça, idade e região continuam marcando o
          cenário educacional brasileiro.
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
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">
                Desigualdade Racial
              </h3>
              <p className="text-muted-foreground text-xl leading-relaxed mb-4">
                A cor da pele ainda influencia as chances de ser alfabetizado no
                Brasil. Enquanto as populações <strong>Branca e Amarela</strong>{" "}
                apresentam taxas superiores a 95%, os grupos{" "}
                <strong>Preto, Pardo e Indígena</strong> enfrentam barreiras
                históricas que refletem no acesso à educação básica.
              </p>
            </div>

            <div ref={trigger2Ref} className="h-[70vh] pt-[15vh]">
              <h3 className="text-2xl font-bold text-teal-400 mb-4">
                Gerações e Acesso
              </h3>
              <p className="text-muted-foreground text-xl leading-relaxed mb-4">
                O analfabetismo no Brasil tem idade. A universalização recente
                do ensino garantiu taxas próximas a 100% entre os mais jovens. O
                desafio persiste na população <strong>idosa (65+)</strong>, que
                não teve as mesmas oportunidades de escolarização na juventude e
                carrega o passivo educacional do século passado.
              </p>
            </div>

            <div ref={trigger3Ref} className="h-[70vh] pt-[15vh]">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                Gênero e Educação
              </h3>
              <p>
                Na educação, as mulheres lideram. A taxa de alfabetização
                feminina supera a masculina, consolidando uma tendência de maior
                escolaridade entre as mulheres observada nas últimas décadas.
                Elas permanecem mais tempo na escola e completam mais etapas do
                ensino.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ChapterFour;
