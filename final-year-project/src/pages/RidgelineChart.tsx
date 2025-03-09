import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RidgelineChart: React.FC = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const data = [
      { month: "Jan", value: 30 },
      { month: "Feb", value: 25 },
      { month: "Mar", value: 40 },
      { month: "Apr", value: 35 },
      { month: "May", value: 50 },
      { month: "Jun", value: 45 },
      { month: "Jul", value: 60 },
      { month: "Aug", value: 55 },
      { month: "Sep", value: 40 },
      { month: "Oct", value: 35 },
      { month: "Nov", value: 25 },
      { month: "Dec", value: 20 },
    ];

    const margin = { top: 30, right: 30, bottom: 40, left: 50 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.1);

    // Create Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .nice()
      .range([height, 0]);

    // Draw Bars
    svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.month)!)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "#69b3a2");

    // Add X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y Axis
    svg.append("g").call(d3.axisLeft(y));

  }, []);

  return <div ref={chartRef}></div>;
};

export default RidgelineChart;
