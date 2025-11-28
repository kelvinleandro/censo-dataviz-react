import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type BrazilGeoJson } from "../types/geojson";

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
    const svg = d3.select(ref.current);

    svg.selectAll("*").remove();

    // Projection
    const projection = d3
      .geoMercator()
      .scale(850)
      .center([-55, -15])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    async function draw() {
      const data = (await d3.json(topoUrl)) as BrazilGeoJson;

      // Generate values: string length of state name
      data.features.forEach((f) => {
        const name = f.properties.name;
        f.value = name.length;
      });

      const values = data.features
        .map((d) => d.value)
        .filter((v): v is number => v !== undefined);
      const [min, max] = d3.extent(values) as [number, number];

      // Color scale
      const color = d3
        .scaleSequential<string>()
        .domain([min || 0, max || 0])
        .interpolator(d3.interpolateBlues);

      svg
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", (d) => path(d))
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
