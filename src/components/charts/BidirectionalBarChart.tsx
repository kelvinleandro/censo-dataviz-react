"use client";

import { ChartData } from "@/types/api";
import React, { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import * as vl from "vega-lite-api";

interface BidirectionalBarChartProps {
  data: ChartData;
  categoryField: string;
  valueField: string;
  colorField: string;
  colorScheme?: string[];
  width?: number | "container";
  height?: number | "container";
  title?: string;
  order?: "ascending" | "descending" | null;
  xLabel?: string;
  yLabel?: string;
}

const BidirectionalBarChart: React.FC<BidirectionalBarChartProps> = ({
  data,
  categoryField,
  valueField,
  colorField,
  colorScheme = ["#fd8d3c", "#6baed6"], // Default orange and blue
  width = "container",
  height = "container",
  title,
  order = null,
  xLabel,
  yLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const styles = getComputedStyle(document.documentElement);
    const defaultTextColor =
      styles.getPropertyValue("--color-foreground").trim() || "#fff";

    let categoryDef = vl
      .y()
      .fieldN(categoryField)
      .title(yLabel ?? "")
      .axis({ offset: 5, ticks: false, minExtent: 60, domain: false });

    if (order) {
      categoryDef = categoryDef.sort({ field: valueField, order });
    }

    const bars = vl.markBar().encode(
      vl
        .x()
        .fieldQ(valueField)
        .title(xLabel ?? ""),
      categoryDef,
      vl
        .color()
        .fieldN(colorField)
        .scale({ range: colorScheme })
        .legend({ orient: "top" }),
      vl.tooltip([
        { field: categoryField, type: "nominal" },
        {
          field: valueField,
          type: "quantitative",
          format: ",.0f",
          title: "Population",
        },
        { field: colorField, type: "nominal" },
      ])
    );

    const text = vl
      .markText({
        align: { expr: `datum.${valueField} < 0 ? 'left' : 'right'` },
        dx: { expr: `datum.${valueField} < 0 ? 5 : -5` },
        baseline: "middle",
        color: defaultTextColor,
      })
      .transform({
        calculate: `format(datum.${valueField} / 1000000, ',.1f') + ' Mi'`,
        as: "label",
      })
      .encode(
        vl.x().fieldQ(valueField),
        categoryDef,
        vl.text().fieldN("label")
      );

    const chart = vl
      .layer(bars, text)
      .data(data)
      .title(title ?? "")
      .width(width)
      .height(height)
      .config({
        background: null,
        view: { stroke: null },
        axis: {
          grid: false,
          labelColor: defaultTextColor,
          titleColor: defaultTextColor,
          domainColor: defaultTextColor,
          tickColor: defaultTextColor,
        },
        legend: {
          titleColor: defaultTextColor,
          labelColor: defaultTextColor,
        },
      });

    const spec: VisualizationSpec = chart.toSpec();

    embed(ref.current, spec, {
      actions: false,
      renderer: "canvas",
      defaultStyle: true,
      config: {
        background: null,
      },
    });

    return () => {};
  }, [
    data,
    categoryField,
    valueField,
    colorField,
    colorScheme,
    width,
    height,
    title,
    order,
    xLabel,
    yLabel,
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

export default BidirectionalBarChart;
