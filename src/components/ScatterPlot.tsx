import React from "react";
import ReactECharts from "echarts-for-react";

const ScatterPlot: React.FC = () => {
  const option = {
    title: {
      text: "Full-Page Scatter Plot",
      left: "center",
      top: 20,
    },
    grid: {
      left: "0%", // Remove left padding
      right: "0%", // Remove right padding
      top: "10%", // Remove top padding
      bottom: "0%", // Remove bottom padding
      containLabel: false, // Ensure no extra spacing
    },
    xAxis: {
      show: false,
    },
    yAxis: {
      show: false,
    },
    series: [
      {
        symbolSize: 10,
        data: Array.from({ length: 1000 }, () => [
          Math.random() * 100,
          Math.random() * 100,
        ]),
        type: "scatter",
      },
    ],
    tooltip: {
      trigger: "item",
      formatter: (params: any) => `(${params.value[0]}, ${params.value[1]})`,
    },
  };

  return (
    <div
      style={{
        position: "absolute", // Ensures no extra margins
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
      }}
    >
      <ReactECharts option={option} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default ScatterPlot;
