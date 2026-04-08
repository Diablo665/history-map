import React, { useState, useEffect } from "react";
import MapPreview from "./components/MapPreview/MapPreview";
import AddPointPanel from "./components/AddPointPanel/AddPointPanel";
import LoginForm from "./components/LoginForm/LoginForm";
import "./styles.css";

const App = () => {
  const [mapCoords, setMapCoords] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleMapPointSelect = (coords) => {
    setMapCoords(coords);
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isLoggedIn = localStorage.getItem('isAuthenticated');

      if (token && isLoggedIn === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div id="mainConteiner">
        <LoginForm />
      </div>
    );
  }

  return (
    <div id="mainConteiner">
      <div id="mapPanel">
        <MapPreview onPointSelect={handleMapPointSelect} />
      </div>
      <div id="addPointInfoPanel">
        <AddPointPanel mapCoords={mapCoords} />
      </div>
    </div>
  );
};

export default App;