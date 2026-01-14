"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BrazilMap = dynamic(() => import("@/components/BrazilMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Carregando Mapa...
    </div>
  ),
});

const ScatterPlot = dynamic(() => import("@/components/charts/ScatterPlot"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      Carregando Gráfico...
    </div>
  ),
});

const BarChart = dynamic(() => import("@/components/charts/BarChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      Carregando Gráfico...
    </div>
  ),
});

const generateData = (numSamples: number) => {
  const samples = [];
  for (let i = 0; i < numSamples; i++) {
    samples.push({
      age: Math.floor(Math.random() * 100),
      income: Math.floor(Math.random() * 10000),
      gender: Math.random() > 0.5 ? "M" : "F",
    });
  }
  return samples;
};

const fruitSalesData = [
  { product: "Apples", sales: 120, category: "Fruits" },
  { product: "Bananas", sales: 200, category: "Fruits" },
  { product: "Carrots", sales: 80, category: "Vegetables" },
  { product: "Dates", sales: 150, category: "Fruits" },
  { product: "Eggplants", sales: 90, category: "Vegetables" },
  { product: "Figs", sales: 180, category: "Fruits" },
];

function Home() {
  const [numSamples, setNumSamples] = useState(5);
  const [sampleScatter, setSampleScatter] = useState<
    { age: number; income: number; gender: string }[]
  >(() => generateData(numSamples));

  const [isBarHorizontal, setIsBarHorizontal] = useState(false);
  const [barOrder, setBarOrder] = useState<"ascending" | "descending" | null>(
    null
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setNumSamples(newValue);
    setSampleScatter(generateData(newValue));
  };

  return (
    <div className="pb-12 bg-background min-h-screen">
      <div className="font-body container mx-auto p-4">
        <h1 className="text-center text-foreground text-3xl font-display mb-4">
          Scatter Plot
        </h1>

        <div className="text-center mb-5">
          <label
            htmlFor="sampleSlider"
            className="font-bold mr-2 text-foreground"
          >
            Samples: {numSamples}
          </label>
          <input
            id="sampleSlider"
            type="range"
            min="5"
            max="15"
            step="1"
            value={numSamples}
            onChange={handleSliderChange}
            className="cursor-pointer w-[200px]"
          />
        </div>

        <div className="p-4 rounded-lg flex justify-center bg-muted/10 border border-muted">
          <ScatterPlot
            data={sampleScatter}
            xField="age"
            yField="income"
            colorField="gender"
            width={400}
            height={300}
          />
        </div>
      </div>

      <hr className="my-10 border-muted" />

      <div className="container mx-auto p-4">
        <h1 className="text-center text-foreground text-3xl font-display mb-4">
          Bar Chart
        </h1>

        <div className="flex justify-center gap-5 mb-5 text-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBarHorizontal}
              onChange={(e) => setIsBarHorizontal(e.target.checked)}
              className="accent-primary"
            />
            Horizontal Mode
          </label>

          <label className="flex items-center gap-2">
            Order:
            <select
              value={barOrder ?? "original"}
              onChange={(e) => {
                const val = e.target.value;
                setBarOrder(
                  val === "original"
                    ? null
                    : (val as "ascending" | "descending")
                );
              }}
              className="p-1 rounded bg-muted text-foreground border border-muted-foreground"
            >
              <option value="original">Original Data</option>
              <option value="ascending">Ascending (Low to High)</option>
              <option value="descending">Descending (High to Low)</option>
            </select>
          </label>
        </div>

        <div className="p-4 rounded-lg flex justify-center bg-muted/10 border border-muted mb-10">
          <BarChart
            data={fruitSalesData}
            categoryField="product"
            valueField="sales"
            colorField="category"
            horizontal={isBarHorizontal}
            order={barOrder}
            width={400}
            height={300}
            title={`Sales by Product (${
              isBarHorizontal ? "Horizontal" : "Vertical"
            })`}
          />
        </div>

        <h1 className="text-center text-foreground text-3xl font-display mb-4">
          Animated Map
        </h1>
        <div className="relative w-full h-[600px] border border-muted rounded-xl bg-gradient-card overflow-hidden shadow-2xl">
          <BrazilMap />
        </div>
      </div>
    </div>
  );
}

export default Home;
