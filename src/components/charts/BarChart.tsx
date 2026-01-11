"use client";

import React, { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import * as vl from "vega-lite-api";

interface BarChartProps {
  data: Record<string, unknown>[];
  categoryField: string;
  valueField: string;
  colorField?: string;
  horizontal?: boolean;
  width?: number | "container";
  height?: number | "container";
  colorScheme?: string;
  title?: string;
  order?: "ascending" | "descending" | null;
  color?: string;
  xLabel?: string;
  yLabel?: string;
  tooltipFields?: string[] | Record<string, string>;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  categoryField,
  valueField,
  colorField,
  horizontal = false,
  width = "container",
  height = "container",
  colorScheme = "tealblues",
  title,
  order = null,
  color,
  xLabel,
  yLabel,
  tooltipFields,
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
        { field: categoryField, type: "nominal", title: categoryField },
        {
          field: valueField,
          type: "quantitative",
          format: ",.2f",
          title: valueField,
        },
      ];
    }

    const categoryAxis = horizontal
      ? vl.y().title(yLabel ?? "")
      : vl.x().title(xLabel ?? "");
    const valueAxis = horizontal
      ? vl.x().title(xLabel ?? "")
      : vl.y().title(yLabel ?? "");

    let categoryDef = categoryAxis.fieldN(categoryField);

    if (order) {
      categoryDef = categoryDef.sort({ field: valueField, order });
    }

    const encodings = [
      categoryDef,
      // categoryAxis.fieldN(categoryField).title(categoryField).sort("-y"),

      valueAxis.fieldQ(valueField),

      colorField
        ? vl.color().fieldN(colorField).scale({ scheme: colorScheme })
        : vl.color().value(colorToUse),

      vl.tooltip(tooltipEncodings),
    ];

    const validEncodings = encodings.filter((e) => e !== undefined);

    const chart = vl
      .markBar()
      .data(data)
      .encode(...validEncodings)
      .width(width)
      .height(height)
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
    colorField,
    horizontal,
    width,
    height,
    colorScheme,
    title,
    order,
    color,
    xLabel,
    yLabel,
    tooltipFields,
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

export default BarChart;
