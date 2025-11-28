import "./App.css";
import ScatterPlot from "./components/ScatterPlot";
import { useState } from "react";

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

function App() {
  const [numSamples, setNumSamples] = useState(5);
  const [sampleScatter, setSampleScatter] = useState<
    { age: number; income: number; gender: string }[]
  >(() => generateData(numSamples));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setNumSamples(newValue);
    setSampleScatter(generateData(newValue));
  };

  return (
    <div>
      <label htmlFor="sampleSlider" style={{ fontWeight: "bold" }}>
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
      <ScatterPlot
        data={sampleScatter}
        xField="age"
        yField="income"
        width={400}
        height={400}
      />
    </div>
  );
}

export default App;
