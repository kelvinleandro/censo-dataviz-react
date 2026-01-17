"use client";

import { ChartData } from "@/types/api";
import React, { useEffect, useRef, useState } from "react";
import embed from "vega-embed";
import { Spec } from "vega";

interface TreemapProps {
  data: ChartData;
  valueField: string;
  categoryField: string;
  width?: number | "container";
  height?: number;
  colorScheme?: string;
  title?: string;
  tooltipFields?: Record<string, string>;
  color?: string;
}

const Treemap: React.FC<TreemapProps> = ({
  data,
  valueField,
  categoryField,
  width: initialWidth = "container",
  height = 400,
  colorScheme = "tableau10",
  title,
  tooltipFields = null,
  color = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null); // For measurement
  const chartRef = useRef<HTMLDivElement>(null); // For rendering
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    handleResize(); // Set initial width

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current && containerWidth > 0) {
      chartRef.current.innerHTML = "";
      const width =
        initialWidth === "container" ? containerWidth : initialWidth;

      const transformedData = data.map((d) => ({
        ...d,
        parent: "root" as string | null,
      }));
      const rootNode = {
        [categoryField]: "root",
        parent: null,
        [valueField]: 0,
      };
      transformedData.push(rootNode);

      const styles = getComputedStyle(document.documentElement);
      const defaultColor = styles.getPropertyValue("--color-foreground").trim();
      const colorToUse = color ?? defaultColor;

      const tooltipSignal = tooltipFields
        ? `{${Object.entries(tooltipFields)
            .map(([key, value]) => `'${key}': ${value}`)
            .join(", ")}}`
        : null;

      const spec: Spec = {
        $schema: "https://vega.github.io/schema/vega/v6.json",
        width: width,
        height: height,
        padding: 5,
        ...(title
          ? {
              title: {
                text: title,
                color: colorToUse,
                fontSize: 16,
              },
            }
          : {}),
        data: [
          {
            name: "source",
            values: transformedData,
            transform: [
              {
                type: "stratify",
                key: categoryField,
                parentKey: "parent",
              },
              {
                type: "treemap",
                field: valueField,
                sort: { field: "value", order: "descending" },
                round: true,
                size: [width, height],
                padding: 2,
              },
            ],
          },
          {
            name: "leaves",
            source: "source",
            transform: [{ type: "filter", expr: "!datum.children" }],
          },
        ],

        scales: [
          {
            name: "color",
            type: "ordinal",
            range: { scheme: colorScheme },
            domain: { data: "leaves", field: categoryField },
          },
        ],

        marks: [
          {
            type: "rect",
            from: { data: "leaves" },
            encode: {
              enter: {
                fill: { scale: "color", field: categoryField },
                stroke: { value: "white" },
              },
              update: {
                x: { field: "x0" },
                y: { field: "y0" },
                x2: { field: "x1" },
                y2: { field: "y1" },
                ...(tooltipSignal
                  ? {
                      tooltip: { signal: tooltipSignal },
                    }
                  : {}),
              },
              hover: {
                stroke: { value: "black" },
                strokeWidth: { value: 1.5 },
              },
            },
          },
          {
            type: "text",
            from: { data: "leaves" },
            interactive: false,
            encode: {
              enter: {
                text: { field: categoryField },
                align: { value: "center" },
                baseline: { value: "middle" },
                fill: { value: "white" },
                fontWeight: { value: "bold" },
              },
              update: {
                x: { signal: "(datum.x0 + datum.x1) / 2" },
                y: { signal: "(datum.y0 + datum.y1) / 2" },
                opacity: {
                  signal:
                    "(datum.x1 - datum.x0) > 60 && (datum.y1 - datum.y0) > 25 ? 1 : 0",
                },
              },
            },
          },
        ],
      };

      const result = embed(chartRef.current, spec, { actions: false });
      result.catch(console.error);

      return () => {
        result.then((res) => res.finalize()).catch(console.warn);
      };
    }
  }, [
    data,
    valueField,
    categoryField,
    initialWidth,
    height,
    colorScheme,
    title,
    tooltipFields,
    color,
    containerWidth,
  ]);

  return (
    <div ref={containerRef}>
      <div ref={chartRef}></div>
    </div>
  );
};

export default Treemap;
