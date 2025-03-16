import { useEffect, useState } from "react";

const useWeatherData = (city) => {
    const [data, setData] = useState([]);
    const [cityName, setCityName] = useState("");
    const WeatherAPI = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeatherData = async () => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WeatherAPI}`
            );
            if (!response.ok) throw new Error("Failed to fetch weather data");

            const fetchedData = await response.json();
            setCityName(fetchedData.name);
            setData([
                { name: "Temp (K)", value: fetchedData.main.temp },
                { name: "Humidity (%)", value: fetchedData.main.humidity },
                { name: "Pressure (hPa)", value: fetchedData.main.pressure }
            ]);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    return { data, cityName, fetchWeatherData };
};

export default useWeatherData;
