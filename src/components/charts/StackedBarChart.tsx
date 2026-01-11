"use client";

import React, { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import * as vl from "vega-lite-api";

interface StackedBarChartProps {
  data: Record<string, unknown>[];
  categoryField: string;
  valueField: string;
  stackField: string;
  horizontal?: boolean;
  normalize?: boolean;
  width?: number | "container";
  height?: number | "container";
  colorScheme?: string;
  title?: string;
  tooltipFields?: string[] | Record<string, string>;
  color?: string;
  xLabel?: string;
  yLabel?: string;
  legendTitle?: string;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  categoryField,
  valueField,
  stackField,
  horizontal = false,
  normalize = false,
  width = "container",
  height = "container",
  colorScheme = "tableau10",
  title,
  tooltipFields,
  color,
  xLabel,
  yLabel,
  legendTitle,
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
      tooltipEncodings = [
        vl.field(categoryField),
        vl.field(stackField),
        vl.field(valueField).format(",.2f"),
      ];
    }

    const valueAxisObj = horizontal
      ? vl.x().title(xLabel ?? valueField)
      : vl.y().title(yLabel ?? valueField);

    const categoryAxisObj = horizontal
      ? vl.y().title(yLabel ?? categoryField)
      : vl.x().title(xLabel ?? categoryField);

    let valueDef = valueAxisObj.fieldQ(valueField);
    if (normalize) {
      valueDef = valueDef.stack("normalize").axis({ format: "%" });
    }

    const encodings = [
      categoryAxisObj.fieldN(categoryField),
      valueDef,
      vl
        .color()
        .fieldN(stackField)
        .scale({ scheme: colorScheme })
        .title(legendTitle ?? stackField),
      vl.tooltip(tooltipEncodings),
    ];

    const validEncodings = encodings.filter((e) => e !== undefined);

    const chart = vl
      .markBar()
      .data(data)
      .encode(...validEncodings)
      .width(typeof width === "number" ? width : undefined)
      .height(typeof height === "number" ? height : undefined)
      .title(title ?? "")
      .config({
        background: null,
        view: { stroke: null },
        axis: {
          tickColor: colorToUse,
          titleColor: colorToUse,
          labelColor: colorToUse,
          domainColor: colorToUse,
        },
        legend: {
          titleColor: colorToUse,
          labelColor: colorToUse,
        },
        title: {
          color: colorToUse,
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
    categoryField,
    valueField,
    stackField,
    horizontal,
    normalize,
    width,
    height,
    colorScheme,
    title,
    tooltipFields,
    color,
    xLabel,
    yLabel,
    legendTitle,
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

export default StackedBarChart;
