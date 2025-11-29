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
  order,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const categoryAxis = horizontal ? vl.y() : vl.x();
    const valueAxis = horizontal ? vl.x() : vl.y();

    let categoryDef = categoryAxis.fieldN(categoryField).title(categoryField);

    if (order) {
      categoryDef = categoryDef.sort({ field: valueField, order });
    }

    const encodings = [
      categoryDef,
      // categoryAxis.fieldN(categoryField).title(categoryField).sort("-y"),

      valueAxis.fieldQ(valueField).title(valueField),

      colorField
        ? vl.color().fieldN(colorField).scale({ scheme: colorScheme })
        : vl.color().value("#4c78a8"),

      vl.tooltip([
        { field: categoryField, type: "nominal", title: categoryField },
        {
          field: valueField,
          type: "quantitative",
          format: ",.2f",
          title: valueField,
        },
        // vl.fieldN(categoryField),
        // vl.fieldQ(valueField).format(",.2f"),
      ]),
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
        view: { stroke: null },
      });

    const spec: VisualizationSpec = chart.toSpec();

    spec.autosize = {
      type: "fit",
      contains: "padding",
      resize: true,
    };

    const result = embed(ref.current, spec, {
      actions: false,
      renderer: "canvas",
      defaultStyle: true,
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
