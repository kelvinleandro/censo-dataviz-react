"use client";

import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

interface LiteracyByRace {
  cor_raca: string;
  taxa_alfabetizacao: number;
}

interface LiteracyByAgeGroup {
  grupo_idade: string;
  taxa: number;
}

interface ChartData {
  category: string;
  value: number;
}

const TransitionPage = () => {
  const [raceData, setRaceData] = useState<ChartData[]>([]);
  const [ageData, setAgeData] = useState<ChartData[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const trigger1Ref = useRef<HTMLDivElement | null>(null);
  const trigger2Ref = useRef<HTMLDivElement | null>(null);
  const svgContainer = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRace = await fetch("/api/literacy-rate-by-race");
        if (!resRace.ok) throw new Error("Failed to fetch literacy by race");
        const rawRaceData: LiteracyByRace[] = await resRace.json();
        setRaceData(
          rawRaceData.map((d) => ({
            category: d.cor_raca,
            value: d.taxa_alfabetizacao,
          }))
        );

        const resAge = await fetch("/api/literacy-by-age-group");
        if (!resAge.ok) throw new Error("Failed to fetch literacy by age");
        const rawAgeData: LiteracyByAgeGroup[] = await resAge.json();
        setAgeData(
          rawAgeData.map((d) => ({
            category: d.grupo_idade,
            value: d.taxa,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || raceData.length === 0 || ageData.length === 0) {
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    if (!svgContainer.current) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

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
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);

    const update = (data: ChartData[]) => {
      const sortedData = [...data].sort(
        (a, b) => a.value - b.value || a.category.localeCompare(b.category)
      );

      x.domain([0, d3.max(sortedData, (d) => d.value) as number]);
      y.domain(sortedData.map((d) => d.category));

      g.select<SVGGElement>(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(5, "%"));

      g.select<SVGGElement>(".y-axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).tickSizeOuter(0));

      const bars = g
        .selectAll<SVGRectElement, ChartData>(".bar")
        .data(sortedData, (d) => d.category);

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => y(d.category) as number)
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", "steelblue")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.category) as number)
        .attr("width", (d) => x(d.value))
        .attr("height", y.bandwidth());

      bars.exit().transition().duration(1000).attr("width", 0).remove();
    };

    update(raceData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === trigger1Ref.current) {
              update(raceData);
            } else if (entry.target === trigger2Ref.current) {
              update(ageData);
            }
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const currentTrigger1 = trigger1Ref.current;
    const currentTrigger2 = trigger2Ref.current;

    if (currentTrigger1) observer.observe(currentTrigger1);
    if (currentTrigger2) observer.observe(currentTrigger2);

    return () => {
      if (currentTrigger1) observer.unobserve(currentTrigger1);
      if (currentTrigger2) observer.unobserve(currentTrigger2);
    };
  }, [raceData, ageData]);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center" }}>
      <div className="px-8 text-2xl">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro.
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: "50%" }}>
          <div
            ref={trigger1Ref}
            style={{ height: "100vh", paddingTop: "40vh", opacity: 0.8 }}
          >
            <h2>Literacy Rate by Race</h2>
            <p>
              This chart shows the literacy rate among different racial groups
              in Brazil.
            </p>
          </div>
          <div
            ref={trigger2Ref}
            style={{ height: "100vh", paddingTop: "40vh", opacity: 0.8 }}
          >
            <h2>Literacy Rate by Age Group</h2>
            <p>
              This chart shows the literacy rate across different age groups.
            </p>
          </div>
          <div style={{ height: "50vh" }}></div>
        </div>
        <div style={{ width: "50%", position: "sticky", top: "25vh" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg ref={svgRef}></svg>
          </div>
        </div>
      </div>

      <div className="px-8 text-2xl">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro. Lorem
        ipsum, dolor sit amet consectetur adipisicing elit. Officiis a
        cupiditate quidem quasi quis vitae porro deleniti voluptas fugiat ipsum!
        Qui eius modi quia. Laudantium sint minus quidem reiciendis porro.
      </div>
    </div>
  );
};

export default TransitionPage;
