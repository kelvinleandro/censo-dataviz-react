"use client";

import React, { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import * as vl from "vega-lite-api";

interface ScatterPlotProps {
  data: Record<string, unknown>[];
  xField: string;
  yField: string;
  xLabel?: string;
  yLabel?: string;
  colorField?: string;
  sizeField?: string;

  width?: number | "container";
  height?: number | "container";

  pointSize?: number;
  colorScheme?: string;
  color?: string;
  title?: string;
  tooltipFields?: string[] | Record<string, string>;
  startAtZero?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  fontSize?: number;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xField,
  yField,
  colorField,
  sizeField,

  width = "container",
  height = "container",

  pointSize = 40,
  colorScheme = "blues",
  title,
  color,
  tooltipFields,
  startAtZero = false,
  xLabel,
  yLabel,
  gridColor = "#fff",
  gridOpacity = 0.6,
  fontSize = 12,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const styles = getComputedStyle(document.documentElement);
    const defaultColor =
      styles.getPropertyValue("--color-foreground").trim() ?? "#FFF";

    const colorToUse = color ?? defaultColor;

    let tooltipEncodings;
    if (Array.isArray(tooltipFields)) {
      tooltipEncodings = tooltipFields.map((f) => vl.field(f));
    } else if (typeof tooltipFields === "object" && tooltipFields !== null) {
      tooltipEncodings = Object.entries(tooltipFields).map(
        ([field, title]) => ({
          field,
          title,
        })
      );
    } else {
      tooltipEncodings = [vl.field(xField), vl.field(yField)];
    }

    const encodings = [
      vl
        .x()
        .fieldQ(xField)
        .title(xLabel ?? xField)
        .scale({ zero: startAtZero }),
      vl
        .y()
        .fieldQ(yField)
        .title(yLabel ?? yField)
        .scale({ zero: startAtZero }),

      colorField
        ? vl.color().fieldN(colorField).scale({ scheme: colorScheme })
        : undefined,

      sizeField ? vl.size().fieldQ(sizeField) : vl.size().value(pointSize),

      vl.tooltip(tooltipEncodings),
    ];

    const validEncodings = encodings.filter((e) => e !== undefined);

    const chart = vl
      .markCircle()
      .data(data)
      .encode(...validEncodings)
      .width(typeof width === "number" ? width : undefined)
      .height(typeof height === "number" ? height : undefined)
      .title(title ?? "")
      .config({
        background: null,
        view: { stroke: null },
        mark: { tooltip: true },
        axis: {
          tickColor: colorToUse,
          titleColor: colorToUse,
          labelColor: colorToUse,
          domainColor: colorToUse,
          gridColor: gridColor,
          gridOpacity: gridOpacity,
          titleFontSize: fontSize,
          labelFontSize: fontSize,
        },
        legend: {
          titleColor: colorToUse,
          labelColor: colorToUse,
          titleFontSize: fontSize,
          labelFontSize: fontSize,
        },
        title: {
          color: colorToUse,
          fontSize: fontSize + 4,
        },
      });

    const spec: VisualizationSpec = chart.toSpec();

    const result = embed(ref.current, spec, {
      actions: false,
      renderer: "canvas",
      defaultStyle: true,
      config: {
        background: null,
      },
    });

    return () => {
      result.then((res) => res.finalize()).catch(console.warn);
    };
  }, [
    data,
    xField,
    yField,
    colorField,
    sizeField,
    width,
    height,
    colorScheme,
    pointSize,
    title,
    color,
    tooltipFields,
    startAtZero,
    xLabel,
    yLabel,
    gridColor,
    gridOpacity,
    fontSize,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: typeof width === "number" ? width : "100%",
        height: typeof height === "number" ? height : "100%",
        minHeight: "300px",
      }}
    />
  );
};

export default ScatterPlot;
