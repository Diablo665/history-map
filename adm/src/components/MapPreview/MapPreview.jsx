
import React from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import styles from "./MapPreview.module.css";
import { useState } from "react";

const MapPreview = ({ onPointSelect }) => {
    const [coords, setCoords] = useState(null);

    const setNewPoint = (coords) => {
        setCoords(coords);
        const [longitude, latitude] = coords;
        onPointSelect({ latitude, longitude });
    };

    return (
        <div className={styles.mapContainer}>
            <YMaps query={{ lang: "ru_RU" }}>
                <Map
                    onClick={(e) => setNewPoint(e.get("coords"))}
                    className={styles.map}
                    defaultState={{
                        center: [54.815691702033824, 32.04313354492185],
                        zoom: 9
                    }}
                >
                    {coords && <Placemark geometry={coords} />}
                </Map>
            </YMaps>
        </div>
    );
};

export default MapPreview;