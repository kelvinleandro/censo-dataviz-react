"use client";

import React, { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import * as vl from "vega-lite-api";

interface ScatterPlotProps {
  data: Record<string, unknown>[];
  xField: string;
  yField: string;
  colorField?: string;
  sizeField?: string;

  width?: number | "container";
  height?: number | "container";

  pointSize?: number;
  colorScheme?: string;
  title?: string;
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
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const encodings = [
      vl.x().fieldQ(xField).title(xField),
      vl.y().fieldQ(yField).title(yField),

      colorField
        ? vl.color().fieldN(colorField).scale({ scheme: colorScheme })
        : undefined,

      sizeField ? vl.size().fieldQ(sizeField) : vl.size().value(pointSize),

      vl.tooltip([vl.field(xField), vl.field(yField)]),
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
      });

    const spec: VisualizationSpec = chart.toSpec();

    // Responsive config
    spec.autosize = {
      type: "fit",
      contains: "padding",
      resize: true,
    };

    embed(ref.current, spec, {
      actions: false,
      renderer: "canvas",
      defaultStyle: true,
      config: {
        background: null,
      },
    });
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
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: typeof width === "number" ? width : "100%",
        height: typeof height === "number" ? height : "100%",
      }}
    />
  );
};

export default ScatterPlot;
