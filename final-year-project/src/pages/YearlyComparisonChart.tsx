import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface AandEData {
  year: string;
  type1: number;
  type2: number;
  type3: number;
}

interface Props {
  data: AandEData[];
}

const YearlyComparisonChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 600, height = 400;
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    // Clean previous chart
    svg.selectAll("*").remove();

    // X & Y scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([50, width - 50])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.type1 + d.type2 + d.type3) || 0])
      .range([height - 50, 50]);

    // Define colors
    const colors = d3.scaleOrdinal(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Blue, Orange, Green

    // Stacked Data
    const stackedData = d3.stack<AandEData>()
      .keys(["type1", "type2", "type3"])
      (data);

    // Draw Bars
    svg.selectAll("g")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("fill", (_, i) => colors(i.toString()) as string)
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.data.year)!)
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // X-Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xScale));

    // Y-Axis
    svg.append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(yScale));

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default YearlyComparisonChart;
