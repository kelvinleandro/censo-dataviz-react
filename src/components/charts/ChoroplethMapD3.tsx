"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type FeatureCollection, type Feature } from "geojson";

interface ChoroplethMapD3Props {
  data: Record<string, unknown>[];
  locationField: string;
  valueField: string;
  geoJsonProperty?: string;
  width?: number;
  height?: number;
  geoJsonUrl?: string;
  tooltipFields?: Record<string, string>;
}

type BrazilStateFeature = Feature & {
  properties: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
};

const ChoroplethMapD3: React.FC<ChoroplethMapD3Props> = ({
  data,
  locationField,
  valueField,
  geoJsonProperty = "name",
  width = 500,
  height = 400,
  geoJsonUrl = "/brazil-states.geojson",
  tooltipFields,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const geoJsonCache = useRef<FeatureCollection | null>(null);

  // Effect to draw the base map
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);

    const projection = d3
      .geoMercator()
      .scale(600)
      .center([-52, -15])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    async function drawBaseMap() {
      if (svg.selectAll(".state").size() > 0) return;

      if (!geoJsonCache.current) {
        try {
          geoJsonCache.current = (await d3.json(
            geoJsonUrl
          )) as FeatureCollection;
        } catch (error) {
          console.error("Error loading GeoJSON:", error);
          return;
        }
      }

      svg
        .selectAll("path")
        .data(geoJsonCache.current.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#222")
        .attr("class", "state")
        .attr("fill", "lightgray")
        .append("title")
        .text((d) => (d as BrazilStateFeature).properties[geoJsonProperty]);
    }

    drawBaseMap();
  }, [width, height, geoJsonUrl, geoJsonProperty]);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);

    if (!data || data.length === 0) {
      svg
        .selectAll(".state")
        .transition()
        .duration(1000)
        .attr("fill", "lightgray")
        .select("title")
        .text(
          (d) =>
            `${(d as BrazilStateFeature).properties[geoJsonProperty]}: No data`
        );
      return;
    }

    const dataMap = new Map(data.map((d) => [d[locationField] as string, d]));
    const values = data.map((d) => d[valueField] as number);
    const [min, max] = d3.extent(values);

    const color = d3
      .scaleSequential<string>()
      .domain([min ?? 0, max ?? 1])
      .interpolator(d3.interpolateBlues);

    svg
      .selectAll<SVGPathElement, BrazilStateFeature>(".state")
      .transition()
      .duration(1000)
      .attr("fill", (d) => {
        const stateName = d.properties[geoJsonProperty];
        const item = dataMap.get(stateName);
        const value = item ? (item[valueField] as number) : undefined;
        return value !== undefined && value !== null
          ? color(value)
          : "lightgray";
      })
      .select("title")
      .text((d) => {
        const stateName = d.properties[geoJsonProperty];
        const item = dataMap.get(stateName);

        if (!item) {
          return `${stateName}: Sem dados`;
        }

        if (tooltipFields) {
          const lines: string[] = [];
          Object.entries(tooltipFields).forEach(([key, label]) => {
            const val = item[key];
            const valStr =
              typeof val === "number"
                ? val.toLocaleString("pt-BR")
                : val !== undefined && val !== null
                ? String(val)
                : "-";
            lines.push(`${label}: ${valStr}`);
          });
          return lines.join("\n");
        }

        const value = item[valueField] as number;
        return `${stateName}: ${
          value !== undefined && value !== null
            ? value.toLocaleString("pt-BR")
            : "Sem dados"
        }`;
      });
  }, [data, locationField, valueField, geoJsonProperty, tooltipFields]);

  return <svg ref={ref} width={width} height={height} />;
};

export default ChoroplethMapD3;
