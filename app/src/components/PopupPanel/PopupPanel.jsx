
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePopup, setPopupData, setPopupError } from '../../store/popupSlice';
import styles from './PopupPanel.module.css';

const PopupPanel = () => {
    const dispatch = useDispatch();
    const { isOpen, pointId, data, loading, error } = useSelector(state => state.popup);
    const API_URL = 'https://bc109a6da9ed.hosting.myjino.ru/';

    useEffect(() => {

        if (!isOpen || !pointId) return;

        const fetchPointData = async () => {

            try {
                const response = await fetch(`${API_URL}/api/data/${pointId}`);
                if (!response.ok) throw new Error('Ошибка загрузки данных');
                const pointData = await response.json();

                let allPhotos = [];
                if (pointData.photo_path) {
                    allPhotos = Array.isArray(pointData.photo_paths)
                        ? pointData.photo_paths
                        : [pointData.photo_paths];
                }

                let allAudio = [];
                if (pointData.audio_paths && Array.isArray(pointData.audio_paths)) {
                    allAudio = pointData.audio_paths.filter(audio => audio != null && audio.trim() !== '');
                } else if (pointData.audio_path) {
                    allAudio = Array.isArray(pointData.audio_path)
                        ? pointData.audio_path.filter(audio => audio != null && audio.trim() !== '')
                        : [pointData.audio_path].filter(audio => audio != null && audio.trim() !== '');
                }

                dispatch(setPopupData({
                    ...pointData,
                    allPhotos,
                    allAudio,
                    currentPhoto: allPhotos[0] || `${API_URL}/images/placeholder.jpg`,
                    currentAudio: allAudio[0] || null
                }));
            } catch (err) {
                dispatch(setPopupError(err.message));
            }
        };

        fetchPointData();
    }, [isOpen, pointId, dispatch]);

    if (!isOpen) return null;

    if (loading) return (
        <div className={styles.overlay} onClick={() => dispatch(closePopup())}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.loading}>Загрузка данных...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.overlay} onClick={() => dispatch(closePopup())}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.error}>Ошибка: {error}</div>
                <button className={styles.close} onClick={() => dispatch(closePopup())}>×</button>
            </div>
        </div>
    );

    if (!data) return null;

    const {
        title,
        id,
        latitude,
        longitude,
        years,
        text,
        allAudio,
        allPhotos,
        currentPhoto
    } = data;

    const setCurrentPhoto = (photo) => {
        dispatch(setPopupData({
            ...data,
            currentPhoto: photo
        }));
    };

    return (
        <div className={styles.overlay} onClick={() => dispatch(closePopup())}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <button className={styles.close} onClick={() => dispatch(closePopup())}>×</button>

                <div className={styles.content}>
                    <div className={styles.leftPanel}>
                        <div className={styles.photoDisplay}>
                            <img
                                src={`https://bc109a6da9ed.hosting.myjino.ru/${currentPhoto}`}
                                alt={title}
                                onError={(e) => {
                                    e.target.src = 'https://bc109a6da9ed.hosting.myjino.ru/images/placeholder.jpg';
                                }}
                            />
                        </div>

                        <div className={styles.infoPanel}>
                            <h3>{title}</h3>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ID:</span>
                                <span>{id}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Координаты:</span>
                                <span>{latitude}, {longitude}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Годы:</span>
                                <span>{years || 'Не указаны'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Описание:</span>
                                <p>{text}</p>
                            </div>
                            {allAudio && allAudio.length > 0 && (
                                <div className={styles.audioList}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Аудиофайлы:</span>
                                    </div>
                                    {allAudio.map((audio, index) => (
                                        <div key={index} className={styles.audioItem}>
                                            <audio controls src={audio.startsWith('http') ? audio : `${API_URL}${audio}`}>
                                                Ваш браузер не поддерживает аудио
                                            </audio>
                                            <div className={styles.audioLabel}>Аудио {index + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightPanel}>
                        <h4>Все фото</h4>
                        <div className={styles.photosList}>
                            {allPhotos.length > 0 ? (
                                allPhotos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.photoItem} ${photo === currentPhoto ? styles.active : ''}`}
                                        onClick={() => setCurrentPhoto(photo)}
                                    >
                                        <img
                                            src={`https://bc109a6da9ed.hosting.myjino.ru/${photo}`}
                                            alt={`Фото ${index + 1}`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const placeholder = e.target.nextElementSibling;
                                                if (placeholder) placeholder.style.display = 'block';
                                            }}
                                        />
                                        <div className={styles.placeholderText} style={{ display: 'none' }}>
                                            Фото недоступно
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noPhotos}>Нет фотографий</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupPanel;