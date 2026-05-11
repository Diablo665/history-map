import React, { useState, useEffect } from "react";
import MapPreview from "./components/MapPreview/MapPreview";
import AddPointPanel from "./components/AddPointPanel/AddPointPanel";
import LoginForm from "./components/LoginForm/LoginForm";
import StatisticsPanel from "./components/StatisticsPanel/StatisticsPanel";
import "./styles.css";

const App = () => {
    const [mapCoords, setMapCoords] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const VERIFY_API = process.env.REACT_APP_VERIFY_API;

    const handleMapPointSelect = (coords) => {
        setMapCoords(coords);
    };


    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await fetch(VERIFY_API, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const rawResponse = await response.text();

                if (!response.ok) {
                    let data;
                    try {
                        data = JSON.parse(rawResponse);
                        console.error('Ошибка сервера', data);
                    } catch (parseError) {
                        console.error('Не удалось обработать ответ от сервера');
                    }
                    setIsAuthenticated(false);
                    return;
                }

                const data = JSON.parse(rawResponse);
                console.log('Успешный ответ от сервера:', data);

                if (data.valid === true) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }

            } catch (error) {
                console.error('Критическая ошибка проверки токена:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, [VERIFY_API]);

    if (isAuthenticated === null) {
        return <div>Проверка авторизации...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div id="mainContainer">
                <LoginForm />
            </div>
        );
    }

    return (
        <div id="mainContainer">
            <div id="mapPanel">
                <MapPreview onPointSelect={handleMapPointSelect} />
                <StatisticsPanel />
            </div>
            <div id="addPointInfoPanel">
                <AddPointPanel mapCoords={mapCoords} />
            </div>
        </div>
    );
};

export default App;