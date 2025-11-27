import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type GeoJson } from "../types/geojson";

export interface ChoroplethMapProps {
  width?: number;
  height?: number;
  topoUrl?: string; // GeoJSON or TopoJSON URL
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({
  width = 800,
  height = 600,
  topoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson",
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Clear previous render (React strict mode compatibility)
    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current);

    // Projection
    const projection = d3
      .geoMercator()
      .scale(850)
      .center([-55, -15])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    async function draw() {
      const data = (await d3.json(topoUrl)) as GeoJson;

      // Generate values: string length of state name
      data.features.forEach((f) => {
        const name = f.properties.name;
        f.value = name.length;
      });

      function extentNumbers(vals: number[]): [number, number] {
        const e = d3.extent(vals);
        return [e[0] ?? 0, e[1] ?? 0];
      }

      const domain = extentNumbers(
        data.features.map((d) => d.value) as number[]
      );

      // Color scale
      const color = d3
        .scaleSequential<string>()
        .domain(domain)
        .interpolator(d3.interpolateBlues);

      svg
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", (d) => path(d)!)
        .attr("fill", (d) => color(d.value as number))
        .attr("stroke", "#222")
        .append("title")
        .text((d) => `${d.properties.name}: ${d.value}`);
    }

    draw();
  }, [width, height, topoUrl]);

  return <svg ref={ref} width={width} height={height} />;
};

export default ChoroplethMap;
