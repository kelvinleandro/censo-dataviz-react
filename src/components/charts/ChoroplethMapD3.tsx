"use client";

import React, { useEffect, useRef, useId } from "react";
import * as d3 from "d3";
import { type FeatureCollection, type Feature } from "geojson";

export type ColorScheme = "greens" | "blues" | "oranges";

interface ChoroplethMapD3Props {
  data: Record<string, unknown>[];
  locationField: string;
  valueField: string;
  geoJsonProperty?: string;
  width?: number;
  height?: number;
  geoJsonUrl?: string;
  tooltipFields?: Record<string, string>;
  colorScheme?: ColorScheme;
}

type BrazilStateFeature = Feature & {
  properties: {
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
  colorScheme = "oranges",
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const geoJsonCache = useRef<FeatureCollection | null>(null);
  const uniqueId = useId();
  const tooltipId = `tooltip-${uniqueId.replace(/:/g, "")}`;

  useEffect(() => {
    let tooltip = d3.select<HTMLDivElement, unknown>(`#${tooltipId}`);
    
    if (tooltip.empty()) {
        tooltip = d3.select("body")
        .append("div")
        .attr("id", tooltipId)
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

    return () => {
      d3.select(`#${tooltipId}`).remove();
    };
  }, [tooltipId]);

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
        .attr("fill", "lightgray");
    }

    drawBaseMap();
  }, [width, height, geoJsonUrl, geoJsonProperty]);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    const tooltip = d3.select(`#${tooltipId}`);

    if (!data || data.length === 0) {
      svg
        .selectAll(".state")
        .transition()
        .duration(1000)
        .attr("fill", "lightgray");
      
      svg.selectAll(".state")
          .on("mouseover", function(event, d) {
             const feature = d as BrazilStateFeature;
             d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
             const stateName = feature.properties[geoJsonProperty];
             
             const html = `
               <div style="font-weight: bold; font-size: 16px; color: #1e293b; margin-bottom: 4px;">${stateName}</div>
               <div style="font-size: 14px; color: #64748b;">Sem dados</div>
             `;
             
             tooltip
                .style("opacity", 1)
                .html(html)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 20 + "px");
          })
          .on("mousemove", function(event) {
             tooltip
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 20 + "px");
          })
          .on("mouseout", function() {
             d3.select(this).attr("stroke", "#222").attr("stroke-width", 1);
             tooltip.style("opacity", 0);
          });
      return;
    }

    const dataMap = new Map(data.map((d) => [d[locationField] as string, d]));
    const values = data.map((d) => d[valueField] as number);
    const [min, max] = d3.extent(values);

    const interpolators: Record<ColorScheme, (t: number) => string> = {
      greens: d3.interpolateGreens,
      blues: d3.interpolateBlues,
      oranges: d3.interpolateOranges,
    };

    const selectedInterpolator = interpolators[colorScheme] || d3.interpolateOranges;

    const color = d3
      .scaleSequential<string>()
      .domain([min ?? 0, max ?? 1])
      .interpolator(selectedInterpolator); 

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
      });

    svg.selectAll<SVGPathElement, BrazilStateFeature>(".state")
      .on("mouseover", function(event, d) {
        d3.select(this)
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .attr("fill-opacity", 0.9);

        const stateName = d.properties[geoJsonProperty];
        const item = dataMap.get(stateName);

        let htmlContent = `<div style="font-weight: bold; font-size: 16px; color: #1e293b; margin-bottom: 4px;">${stateName}</div>`;

        if (!item) {
           htmlContent += `<div style="font-size: 14px; color: #64748b;">Sem dados</div>`;
        } else if (tooltipFields) {
           Object.entries(tooltipFields).forEach(([key, label]) => {
                const val = item[key];
                const valStr = typeof val === "number"
                    ? val.toLocaleString("pt-BR")
                    : (val !== undefined && val !== null ? String(val) : "-");
                
                htmlContent += `<div style="font-size: 14px; color: #334155;">${label}: <span style="font-weight: bold;">${valStr}</span></div>`;
           });
        } else {
           const val = item[valueField];
           const valStr = typeof val === "number" ? val.toLocaleString("pt-BR") : String(val);
           htmlContent += `<div style="font-size: 14px; color: #334155;">Valor: <span style="font-weight: bold;">${valStr}</span></div>`;
        }

        tooltip
            .style("opacity", 1)
            .html(htmlContent)
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px");
      })
      .on("mousemove", function(event) {
         tooltip
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function() {
         d3.select(this)
            .attr("stroke", "#222")
            .attr("stroke-width", 1)
            .attr("fill-opacity", 1);
         tooltip.style("opacity", 0);
      });

  }, [data, locationField, valueField, geoJsonProperty, tooltipFields, tooltipId, colorScheme]); 
  

  return <svg ref={ref} width={width} height={height} />;
};

export default ChoroplethMapD3;