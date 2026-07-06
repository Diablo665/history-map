import React, { useEffect } from "react";
import styles from "./Gallary.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setPhoto, setLoading } from "../../store/gallarySlice";
import { useNavigate } from "react-router-dom";
import { getPhotoUrl } from "../../utils/helper";

const Gallary = () => {
    const API_URL = process.env.REACT_APP_GALLERY_API;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { photo, loading } = useSelector((state) => state.gallary);

    useEffect(() => {

        fetch(`${API_URL}?limit=15`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                dispatch(setPhoto(result));
                dispatch(setLoading(false));
            })
            .catch(error => {
                console.error('Ошибка загрузки фото:', error);
                dispatch(setLoading(false));
            });
    }, [dispatch]);

    if (loading) {
        return (
            <div> Загрузка </div>
        )
    }

    const viewPoint = (pointId) => {
        navigate(`/point/${pointId}`);
    };

    return (
        <div id={styles.gallaryConteiner}>
            <h3>Галерея фотографий</h3>
            {Array.isArray(photo) && photo.length > 0 ? (
                photo.map(photoItem => (
                    <div
                        key={photoItem.id}
                        className={styles.imgConteiner}
                        onClick={() => viewPoint(photoItem.id)}
                    >
                        <img
                            src={getPhotoUrl(photoItem)}
                            className={styles.gallaryImg}
                            alt={photoItem.title || 'Фотография'}
                        />
                        <div className={styles.imgTitle}>
                            {photoItem.title || 'Без названия'}
                        </div>
                    </div>
                ))
            ) : (
                <div className={styles.loading}>Фотографии не найдены</div>
            )}
        </div>
    )
}

export default Gallary