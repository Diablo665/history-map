import React, {useEffect} from "react";
import styles from "./EventPanel.module.css";
import { useSelector, useDispatch } from "react-redux";
import { setLastEvents, setLoading } from "../../store/eventsSlice";
import { getPhotoUrl } from "../../utils/helper";
import { openPopup } from "../../store/popupSlice";

const EventPanel = () => {
    const API_URL = 'https://bc109a6da9ed.hosting.myjino.ru/';
    const dispatch = useDispatch();
    const {lastEvents, loading} = useSelector((state) => state.events)

    useEffect(() => {
        
        fetch(`${API_URL}/api/events?limit=15`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                dispatch(setLastEvents(result)); 
                dispatch(setLoading(false)); 
            })
            .catch(error => {
                console.error('Ошибка загрузки последних событий:', error);
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
        <div id={styles.eventPanel}> 
            <h3> Последние события </h3>
            {lastEvents && lastEvents.length === 0 ?  <div id={styles.noEventBlock}> Нет новых событий </div> 

                : 

                lastEvents.map(event => ( 
                    <div key={event.id} className={styles.eventBlock}  onClick={() => openPopupOnClick(event.id)}> 
                        <img src={getPhotoUrl(event)} className={styles.eventImg} alt="Картинка"/>
                        <div className={styles.eventInfo}> 
                            <span className={styles.eventTitle}> {event.title} </span>
                            <div className={styles.eventText}> {event.text} </div>
                        </div>
                    </div>

                ))}
            
        </div>
    )
}

export default EventPanel