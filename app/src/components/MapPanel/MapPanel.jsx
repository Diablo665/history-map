import React from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { useState } from "react";
import styles from './MapPanel.module.css';

const MapPanel = () => {
    const apiKey = import.meta.env.VITE_MAP_API_KEY;
    
    const [coordinate, setCoordinate] = useState('')

    const test = (cords) => {
        console.log(cords)
        setCoordinate(cords) 
    
    }
    
    return (
        <div id={styles.mapConteiner}> 
            <YMaps query={{apikey: apiKey, lang: "ru_RU"}} style="width:100%, height: 500px">
                <Map  onClick={(e) => test(e.get("coords"))} id={styles.map}  defaultState={{ center: [54.815691702033824, 32.04313354492185], zoom: 9,}}> 
                    <Placemark geometry={coordinate} />
                </Map>
            </YMaps>
        </div>
    )

}

export default MapPanel