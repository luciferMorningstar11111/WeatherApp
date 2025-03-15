import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../Chart.css";

const BarChart = () => {
    const [data, setData] = useState([]);
    const [theme, setTheme] = useState("light");
    const [country, setCountry] = useState("London");
    const [countryName, setCountryName] = useState("");
    const svgRef = useRef();
    const WeatherAPI = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeatherData = async () => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=${WeatherAPI}` // No units=metric, so temperature remains in Kelvin
            );

            if (!response.ok) throw new Error("Failed to fetch weather data");

            const fetchedData = await response.json();
            setCountryName(fetchedData.name);

            const processedData = [
                { name: "Temp (K)", value: fetchedData.main.temp }, // Temperature in Kelvin
                { name: "Humidity (%)", value: fetchedData.main.humidity },
                { name: "Pressure (hPa)", value: fetchedData.main.pressure }
            ];

            setData(processedData);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    useEffect(() => {
        if (data.length === 0) return;

        const containerWidth = svgRef.current.parentElement.clientWidth;
        const width = containerWidth - 20;
        const height = width * 0.6;
        const margin = { top: 20, right: 20, bottom: 50, left: 50 };

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", height);

        svg.selectAll("*").remove();

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

        // Bars with Animation
        const bars = svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.name))
            .attr("width", xScale.bandwidth())
            .attr("fill", theme === "light" ? "steelblue" : "darkorange")
            .attr("y", height - margin.bottom) // Start from bottom
            .attr("height", 0) // Start from 0 height
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => height - margin.bottom - yScale(d.value));

        // Tooltip on Hover
        svg.selectAll("rect")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", theme === "light" ? "darkblue" : "lightcoral");

                d3.select("#tooltip")
                    .style("visibility", "visible")
                    .text(`${d.name}: ${d.value}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(300).attr("fill", theme === "light" ? "steelblue" : "darkorange");
                d3.select("#tooltip").style("visibility", "hidden");
            });

        // Labels with Fade-in Transition
        svg.selectAll("text.label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.name) + xScale.bandwidth() / 2)
            .attr("y", height - margin.bottom) // Start from bottom
            .attr("opacity", 0) // Start invisible
            .attr("text-anchor", "middle")
            .text(d => d.value)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value) - 5)
            .attr("opacity", 1); // Fade-in effect

    }, [data, theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <div className="checkWeatherContainer">
            <div>
                <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter country"
                />
                <div className="buttonContainer">
                    <button onClick={fetchWeatherData}>Fetch Weather</button>
                    <button onClick={toggleTheme}>Toggle Theme</button>
                </div>
            </div>
            <div className="chartContainer">
                <svg ref={svgRef}></svg>
                <h2>Weather Data Bar Chart ({countryName})</h2>
            </div>

            <div id="tooltip" style={{
                position: "absolute",
                visibility: "hidden",
                background: "#ddd",
                padding: "5px",
                borderRadius: "4px"
            }}></div>
        </div>
    );
};

export default BarChart;
