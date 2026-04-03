import React, {useEffect} from "react";
import styles from "./Gallary.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setPhoto, setLoading } from "../../store/gallarySlice";
import { getPhotoUrl } from "../../utils/helper";
import { openPopup } from "../../store/popupSlice";

const Gallary = () => {
    const API_URL = 'https://bc109a6da9ed.hosting.myjino.ru';
    const dispatch = useDispatch();
    const {photo, loading} = useSelector((state) => state.gallary);

    useEffect(() => {
    
        fetch(`${API_URL}/api/gallery?limit=15`)
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
    
    if(loading){
        return (
            <div> Загрузка </div>
        )
    }

    const openPopupOnClick = (pointId) => {
        dispatch(openPopup(pointId));
    };

    return (
        <div id={styles.gallaryConteiner}> 
            <h3> Галерея: </h3>
                {Array.isArray(photo) && photo.map(photo => (
                    <div key={photo.id} className={styles.imgConteiner}  onClick={() => openPopupOnClick(photo.id)}>
                        <img src={getPhotoUrl(photo)} className={styles.gallaryImg} alt={photo.title} />
                        <div className={styles.imgTitle}> {photo.title} </div>
                    </div>
                ))}
        </div>
    )
}

export default Gallary