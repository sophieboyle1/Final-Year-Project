import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Define the expected data structure
interface AandEData {
  year: string;
  type: string;
  attendances: number;
}

interface Props {
  data: AandEData[];
  selectedYear: string;
}

const YearlyComparisonChart: React.FC<Props> = ({ data, selectedYear }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove(); // Clear old chart

    const width = 600,
      height = 400,
      margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const filteredData = data
      .filter((d) => d.year === selectedYear)
      .map((d) => ({
        ...d,
        attendances: d.attendances || 0, // Ensure no undefined values
      }));

    if (filteredData.length === 0) return;

    // Scales
    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.type))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.attendances) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Append Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Append Bars
    svg
      .append("g")
      .selectAll("rect")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.type) || 0)
      .attr("y", (d) => y(d.attendances))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.attendances))
      .attr("fill", "#3B82F6");
  }, [data, selectedYear]);

  return <svg ref={chartRef} width={600} height={400}></svg>;
};

export default YearlyComparisonChart;
