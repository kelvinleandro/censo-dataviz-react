"use client";

import { useState } from "react";
import BarChart from "@/components/BarChart";
import ScatterPlot from "@/components/ScatterPlot";

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
    <div style={{ paddingBottom: "50px" }}>
      <div>
        <h1 style={{ textAlign: "center", color: "white" }}>Scatter Plot</h1>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <label
            htmlFor="sampleSlider"
            style={{ fontWeight: "bold", color: "#000", marginRight: "10px" }}
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
            style={{ cursor: "pointer", width: "200px" }}
          />
        </div>
        <div style={{ padding: "10px", borderRadius: "8px" }}>
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

      <hr style={{ margin: "40px 0", borderColor: "#000" }} />

      <div>
        <h1 style={{ textAlign: "center", color: "white" }}>Bar Chart</h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "20px",
            color: "#000",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={isBarHorizontal}
              onChange={(e) => setIsBarHorizontal(e.target.checked)}
            />
            Horizontal Mode
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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
              style={{ padding: "4px", borderRadius: "4px" }}
            >
              <option value="original">Original Data</option>
              <option value="ascending">Ascending (Low to High)</option>
              <option value="descending">Descending (High to Low)</option>
            </select>
          </label>
        </div>

        <div style={{ padding: "10px", borderRadius: "8px" }}>
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
      </div>
    </div>
  );
}

export default Home;
