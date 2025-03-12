import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface AandEData {
  season: string;
  total: number;
}

interface Props {
  data: AandEData[];
}

const SeasonalTrendsChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 600, height = 400;
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    svg.selectAll("*").remove();

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.season))
      .range([50, width - 50])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total) || 0])
      .range([height - 50, 50]);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ff7f0e")
      .attr("stroke-width", 3)
      .attr("d", d3.line<AandEData>()
        .x(d => xScale(d.season)!)
        .y(d => yScale(d.total))
      );

    svg.append("g").attr("transform", `translate(0,${height - 50})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(yScale));

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default SeasonalTrendsChart;
