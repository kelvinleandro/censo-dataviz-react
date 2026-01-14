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
  width = 600,
  height = 400,
  geoJsonUrl = "/brazil-states.geojson",
  tooltipFields,
  colorScheme = "oranges",
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const geoJsonCache = useRef<FeatureCollection | null>(null);
  
  const uniqueId = useId();
  const safeId = uniqueId.replace(/:/g, "");
  const tooltipId = `tooltip-${safeId}`;
  const gradientId = `legend-gradient-${safeId}`;

  const legendWidth = 20;
  const legendHeight = 200;
  
  const legendMargin = { top: 20, right: 90 }; 
  const mapWidth = width - legendMargin.right;

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
      .translate([mapWidth / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    async function drawBaseMap() {
      let mapGroup = svg.select<SVGGElement>(".map-group");
      if (mapGroup.empty()) {
        mapGroup = svg.append("g").attr("class", "map-group");
      }

      if (!geoJsonCache.current) {
        try {
          geoJsonCache.current = (await d3.json(geoJsonUrl)) as FeatureCollection;
        } catch (error) {
          console.error("Error loading GeoJSON:", error);
          return;
        }
      }

      const paths = mapGroup
        .selectAll("path")
        .data(geoJsonCache.current.features);

      paths.enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#222")
        .attr("class", "state")
        .attr("fill", "lightgray");
    }

    drawBaseMap();
  }, [width, mapWidth, height, geoJsonUrl, geoJsonProperty]);

  useEffect(() => {
    if (!ref.current) return;
    
    const svg = d3.select<SVGSVGElement, unknown>(ref.current);
    const tooltip = d3.select(`#${tooltipId}`);

    if (!data || data.length === 0) {
      svg.selectAll(".state").transition().attr("fill", "lightgray");
      svg.select(".legend-group").remove();
      return;
    }

    const dataMap = new Map(data.map((d) => [d[locationField] as string, d]));
    const values = data.map((d) => d[valueField] as number);
    const [min, max] = d3.extent(values) as [number, number];

    const interpolators: Record<ColorScheme, (t: number) => string> = {
      greens: d3.interpolateGreens,
      blues: d3.interpolateBlues,
      oranges: d3.interpolateOranges,
    };
    const selectedInterpolator = interpolators[colorScheme] || d3.interpolateOranges;

    const colorScale = d3
      .scaleSequential<string>()
      .domain([min, max])
      .interpolator(selectedInterpolator);

    svg
      .selectAll<SVGPathElement, BrazilStateFeature>(".state")
      .transition()
      .duration(1000)
      .attr("fill", (d) => {
        const stateName = d.properties[geoJsonProperty];
        const item = dataMap.get(stateName);
        const value = item ? (item[valueField] as number) : undefined;
        return value !== undefined && value !== null ? colorScale(value) : "lightgray";
      });

    svg.selectAll<SVGPathElement, BrazilStateFeature>(".state")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 2).attr("fill-opacity", 0.9);
        const stateName = d.properties[geoJsonProperty];
        const item = dataMap.get(stateName);

        let htmlContent = `<div style="font-weight: bold; font-size: 16px; color: #1e293b; margin-bottom: 4px;">${stateName}</div>`;

        if (!item) {
           htmlContent += `<div style="font-size: 14px; color: #64748b;">Sem dados</div>`;
        } else if (tooltipFields) {
           Object.entries(tooltipFields).forEach(([key, label]) => {
                const val = item[key];
                const valStr = typeof val === "number" ? val.toLocaleString("pt-BR") : String(val ?? "-");
                htmlContent += `<div style="font-size: 14px; color: #334155;">${label}: <span style="font-weight: bold;">${valStr}</span></div>`;
           });
        } else {
           const val = item[valueField];
           const valStr = typeof val === "number" ? val.toLocaleString("pt-BR") : String(val);
           htmlContent += `<div style="font-size: 14px; color: #334155;">Valor: <span style="font-weight: bold;">${valStr}</span></div>`;
        }

        tooltip.style("opacity", 1).html(htmlContent)
            .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 20) + "px");
      })
      .on("mousemove", function(event) {
         tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
         d3.select(this).attr("stroke", "#222").attr("stroke-width", 1).attr("fill-opacity", 1);
         tooltip.style("opacity", 0);
      });

    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) {
      defs = svg.append<SVGDefsElement>("defs");
    }

    defs.selectAll(`#${gradientId}`).remove();

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    const stopsData = d3.range(0, 1.1, 0.1); 
    linearGradient
      .selectAll("stop")
      .data(stopsData)
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d * 100}%`)
      .attr("stop-color", (d) => selectedInterpolator(d));

    svg.select(".legend-group").remove();
    
    const legendGroup = svg
      .append<SVGGElement>("g")
      .attr("class", "legend-group")
      .attr("transform", `translate(${width - legendMargin.right}, ${height / 2 - legendHeight / 2})`);

    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", `url(#${gradientId})`)
      .attr("rx", 4)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);

    const legendScale = d3.scaleLinear()
      .domain([min, max])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickPadding(8) 
      .tickFormat((d) => d3.format(".2s")(d as number)); 

    legendGroup
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .select(".domain").remove();

    legendGroup.selectAll("text")
      .attr("fill", "white") 
      .style("font-size", "14px") 
      .style("font-weight", "bold"); 

  }, [data, locationField, valueField, geoJsonProperty, tooltipFields, tooltipId, colorScheme, width, height, mapWidth, gradientId]);

  return <svg ref={ref} width={width} height={height} className="block mx-auto" />;
};

export default ChoroplethMapD3;