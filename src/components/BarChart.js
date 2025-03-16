import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import useWeatherData from "../hooks/useWeatherData";
import Tooltip from "./Tooltip";
import "../Chart.css";

const BarChart = () => {
    const [city, setCity] = useState("London");
    const [theme, setTheme] = useState("light");
    const [tooltip, setTooltip] = useState({ text: "", position: { x: 0, y: 0 } });

    const { data, cityName, fetchWeatherData } = useWeatherData(city);
    const svgRef = useRef();

    const renderChart = useCallback(() => {
        if (data.length === 0 || !svgRef.current) return;

        const containerWidth = svgRef.current.parentElement.clientWidth;
        const width = containerWidth - 20;
        const height = width * 0.6;
        const margin = { top: 20, right: 20, bottom: 50, left: 50 };

        d3.select(svgRef.current).html("");
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.name))
            .attr("width", xScale.bandwidth())
            .attr("fill", theme === "light" ? "steelblue" : "darkorange")
            .attr("y", height - margin.bottom)
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => height - margin.bottom - yScale(d.value));

        svg.selectAll(".bar")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", theme === "light" ? "darkblue" : "lightcoral");
                setTooltip({ text: `${d.name}: ${d.value}`, position: { x: event.pageX + 10, y: event.pageY - 10 } });
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(300).attr("fill", theme === "light" ? "steelblue" : "darkorange");
                setTooltip({ text: "", position: { x: 0, y: 0 } });
            });

        svg.selectAll("text.label").remove();

        svg.selectAll("text.label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.name) + xScale.bandwidth() / 2)
            .attr("y", height - margin.bottom)
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .text(d => d.value)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value) - 5)
            .attr("opacity", 1);


    }, [data, theme]);

    useEffect(() => {
        renderChart();
    }, [renderChart]);

    return (
        <div className="checkWeatherContainer">
            <div>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                />
                <div className="buttonContainer">
                    <button onClick={fetchWeatherData}>Fetch Weather</button>
                    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle Theme</button>
                </div>
            </div>
            <div className="chartContainer">
                <svg ref={svgRef}></svg>
                <h2>Weather Data Bar Chart ({cityName})</h2>
            </div>
            <Tooltip text={tooltip.text} position={tooltip.position} />
        </div>
    );
};

export default BarChart;
