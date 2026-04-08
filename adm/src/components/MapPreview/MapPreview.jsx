import React from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import styles from "./MapPreview.module.css";
import { useState } from "react";

const MapPreview = ({onPointSelect}) => {
    const [coords, setCoords] = useState('')

    const setNewPoint = (coords) => {
        setCoords(coords);
        const [longitude, latitude] = coords;
        onPointSelect({ latitude, longitude });
    }

    return (
        <div id={styles.mapConteiner}> 
            <YMaps query={{lang: "ru_RU"}}>
                <Map onClick={(e) => setNewPoint(e.get("coords"))} id={styles.map}  defaultState={{ center: [54.815691702033824, 32.04313354492185], zoom: 9}}> 
                    <Placemark geometry={coords} />
                </Map>
            </YMaps>
        </div>
    )

}

export default MapPreview