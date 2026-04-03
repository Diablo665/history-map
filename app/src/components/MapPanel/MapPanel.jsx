import React, {useEffect, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { useDispatch, useSelector } from "react-redux";
import { setPoints, setLoading } from "../../store/mapSlice"; 
import { openPopup } from "../../store/popupSlice";
import styles from './MapPanel.module.css';
import { getIconSize, getPhotoUrl } from "../../utils/helper";

const MapPanel = () => {
    const [zoom, setZoom] = useState(9);
    const iconSize = getIconSize(zoom);
    const apiKey = process.env.MAP_API_KEY;
    const API_URL = 'https://bc109a6da9ed.hosting.myjino.ru/';
    const dispatch = useDispatch();
    const {points, loading} = useSelector((state) => state.map)

    useEffect(() => {

        fetch(`${API_URL}/api/point`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                dispatch(setPoints(result)); 
                dispatch(setLoading(false)); 
            })
            .catch(error => {
                console.error('Ошибка загрузки точек:', error);
                dispatch(setLoading(false)); 
            });
    }, [dispatch]);

    if (loading) {
        return <div className={styles.loading}>Загрузка точек...</div>;
    }

    const getNewZoom = (e) => {
    
        const newZoom = e.get('newZoom');
            if (newZoom !== undefined && newZoom !== zoom) {
            setZoom(newZoom);
        }
    };

    const openPopupOnClick = (pointId) => {
        dispatch(openPopup(pointId));
    };

    return (
        <div id={styles.mapConteiner}> 
            <YMaps query={{apikey: apiKey, lang: "ru_RU"}} style="width:100%, height: 500px">
                <Map id={styles.map}  defaultState={{ center: [54.815691702033824, 32.04313354492185], zoom: zoom}} onBoundsChange={getNewZoom}> 
                    {Array.isArray(points) && points.map(point => (
                        <Placemark
                            key={point.id}
                            geometry={[
                                parseFloat(point.longitude),
                                parseFloat(point.latitude),
                            
                            ]}
                            options={{
                                iconLayout: 'default#image',
                                iconImageHref: getPhotoUrl(point), 
                                iconImageSize: iconSize, 
                                iconImageOffset: [
                                    -iconSize[0] / 2, 
                                    -iconSize[1] / 2  
                                ],
                          }}
                            onClick={() => openPopupOnClick(point.id)}
                        />
                    ))}
                </Map>
            </YMaps>
        </div>
    )

}

export default MapPanel

