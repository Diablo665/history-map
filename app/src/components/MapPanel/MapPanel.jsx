import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPoints, setLoading } from "../../store/mapSlice";
import { useNavigate } from "react-router-dom";
import styles from "./MapPanel.module.css";
import { getIconSize, getPhotoUrl } from "../../utils/helper";
import Loading from "../Loading/Loading";

const MapPanel = ({ key }) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [zoom, setZoom] = useState(9);

    const apiKey = process.env.REACT_APP_MAP_API_KEY;
    const API_URL = process.env.REACT_APP_POINTS_API;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { points, loading } = useSelector((state) => state.map);

    useEffect(() => {
        dispatch(setLoading(true));
        fetch(`${API_URL}/point`)
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
            console.error('API Key не найден');
            return;
        }
        const loadYandexMaps = () => {

            return new Promise((resolve, reject) => {
                const scriptExists = !!document.querySelector('script[src*="api-maps.yandex.ru"]');

                if (scriptExists) {

                    const waitForYmaps = () => {
                        if (typeof window.ymaps !== 'undefined') {
                            resolve();
                        } else {
                            setTimeout(waitForYmaps, 50);
                        }
                    };

                    waitForYmaps();
                    return;
                }

                const script = document.createElement('script');
                script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        const initMap = () => {

            if (!containerRef.current || typeof window.ymaps === 'undefined') {
                console.warn('Карта не создана — повтор через 1 секунду');
                setTimeout(initMap, 100);
                return;
            }
            if (mapRef.current) {
                setIsMapReady(true);
                mapRef.current.container.fitToViewport();
                return;
            }

            try {
                const map = new window.ymaps.Map(containerRef.current, {
                    center: [54.815691702033824, 32.04313354492185],
                    zoom: zoom,
                    type: 'yandex#map',
                });

                mapRef.current = map;
                setIsMapReady(true);

                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.container.fitToViewport();
                    }
                }, 150);
            } catch (e) {
                console.error('💥 Ошибка создания карты:', e);
                setTimeout(initMap, 100);
            }
        };

        loadYandexMaps().then(initMap).catch(err => {
            console.error('Не удалось загрузить Яндекс Карту:', err);
        });

        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.destroy();
                } catch (e) {
                    console.warn('Ошибка при уничтожении карты:', e);
                }
                mapRef.current = null;
            }
            setIsMapReady(false);
        };
    }, [apiKey, zoom]);
    
    useEffect(() => {
        const map = mapRef.current;

        if (!isMapReady || !map || !window.ymaps) {
            return;
        }
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
                    iconImageOffset: [-getIconSize(zoom)[0] / 2, -getIconSize(zoom)[1] / 2],
                });

                placemark.events.add('click', () => {
                    navigate(`/point/${point.id}`);
                });

                map.geoObjects.add(placemark);
                newMarkers.push(placemark);
            } catch (e) {
                console.error("💥 Ошибка создания маркера:", e);
                skippedCount++;
            }
        });

        setMarkers(newMarkers);

        if (skippedCount > 0) {
            console.warn(`⚠️ Пропущено ${skippedCount} точек с некорректными координатами`);
        }
    }, [isMapReady, points, zoom, navigate]); // Убери dispatch из зависимостей — он лишний

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
        return <Loading size="large" />;
    }

    return (
        <div className={styles.mapWrapper}>
            <div ref={containerRef} className={styles.ymapContainer} style={{ width: '100%', height: '500px' }} />
        </div>
    );
};

export default MapPanel;

