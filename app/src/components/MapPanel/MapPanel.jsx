import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPoints, setLoading } from "../../store/mapSlice";
import { openPopup } from "../../store/popupSlice";
import styles from "./MapPanel.module.css";
import { getIconSize, getPhotoUrl } from "../../utils/helper";

const MapPanel = () => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [zoom, setZoom] = useState(9);

    const apiKey = process.env.REACT_APP_MAP_API_KEY;
    const API_URL = "https://thevoiceofthefortress.fun/";

    const dispatch = useDispatch();
    const { points, loading } = useSelector((state) => state.map);

    useEffect(() => {
        dispatch(setLoading(true));
        fetch(`${API_URL}/api/point`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then((result) => {
                dispatch(setPoints(result));
                dispatch(setLoading(false));
            })
            .catch((error) => {
                console.error("Ошибка загрузки точек:", error);
                dispatch(setLoading(false));
            });
    }, [dispatch]);

 useEffect(() => {

    if (!apiKey) {
        console.error("API Key не найден");
        return;
    }

    const ensureScript = () => {
        const scriptExists = !!document.querySelector('script[src*="api-maps.yandex.ru"]');
        if (scriptExists) return;
        const script = document.createElement("script");
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
            initMap();
        };
        document.body.appendChild(script);
    };

    const initMap = () => {
        if (!window.ymaps) {
            setTimeout(initMap, 200);
            return;
        }

        if (!containerRef.current) return;

        window.ymaps.ready(() => {
            const map = new window.ymaps.Map(containerRef.current, {
                center: [54.815691702033824, 32.04313354492185],
                zoom: zoom,
                type: "yandex#map", 
            });

            mapRef.current = map;
            setIsMapReady(true);
            console.log("✅ Карта успешно создана");
        });
    };

    ensureScript();

}, [apiKey]);

    useEffect(() => {
        if (!isMapReady || !mapRef.current || !window.ymaps) return;
        const map = mapRef.current;

        markers.forEach((marker) => {
            if (marker) map.geoObjects.remove(marker);
        });
        setMarkers([]);

        if (!Array.isArray(points) || points.length === 0) return;

        const newMarkers = [];
        let skippedCount = 0;

        points.forEach((point) => {
            const rawLat = parseFloat(point.latitude);
            const rawLon = parseFloat(point.longitude);

            if (!isFinite(rawLat) || !isFinite(rawLon)) {
                skippedCount++;
                return;
            }

            const coordinates = [rawLon, rawLat];

            try {
                const placemark = new window.ymaps.GeoObject({
                    geometry: {
                        type: "Point",
                        coordinates: coordinates,
                    },
                }, {
                    iconLayout: "default#image",
                    iconImageHref: getPhotoUrl(point),
                    iconImageSize: getIconSize(zoom),
                    iconImageOffset: [-getIconSize(zoom)[0]/2, -getIconSize(zoom)[1]/2],
                });

                placemark.events.add('click', () => {
                    dispatch(openPopup(point.id));
                });

                map.geoObjects.add(placemark);
                newMarkers.push(placemark);
            } catch (e) {
                console.error("💥 Ошибка создания маркера:", e);
            }
        });

        setMarkers(newMarkers);

        if (skippedCount > 0) {
            console.warn(`⚠️ Пропущено ${skippedCount} точек с некорректными координатами`);
        }
    }, [isMapReady, points, zoom, dispatch]);

    useEffect(() => {
        if (!isMapReady || !mapRef.current) return;
        const map = mapRef.current;

        const handleZoom = () => {
            const currentZoom = map.getZoom();
            setZoom(currentZoom);
        };

        map.events.add("zoomend", handleZoom);
        handleZoom();

        return () => {
            map.events.remove("zoomend", handleZoom);
        };
    }, [isMapReady, markers, points, zoom]);

    if (loading) {
        return <div className={styles.loading}>Загрузка точек...</div>;
    }

    return (
        <div className={styles.mapWrapper}>
            <div ref={containerRef} className={styles.ymapContainer} style={{ width: '100%', height: '500px' }} />
        </div>
    );
};

export default MapPanel;

