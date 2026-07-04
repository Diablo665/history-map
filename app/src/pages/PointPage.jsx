
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PointPage.module.css';

const PointPage = () => {
    const { id } = useParams();
    const [point, setPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isShareSuccess, setIsShareSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    document.querySelector('HTML').setAttribute('data-theme', localStorage.getItem('theme') || 'light')

    const API_URL = 'https://thevoiceofthefortress.fun';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/data/${id}`);
                if (!response.ok) throw new Error('Ошибка загрузки данных точки');
                const data = await response.json();

                let allPhotos = [];
                if (data.photo_path) {
                    allPhotos = Array.isArray(data.photo_paths)
                        ? data.photo_paths
                        : [data.photo_path];
                }

                let allAudio = [];
                if (Array.isArray(data.audio_paths)) {
                    allAudio = data.audio_paths.filter(a => a && a.trim() !== '');
                } else if (data.audio_path) {
                    const single = Array.isArray(data.audio_path) ? data.audio_path : [data.audio_path];
                    allAudio = single.filter(a => a && a.trim() !== '');
                }

                setPoint({
                    ...data,
                    allPhotos,
                    allAudio,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className={styles.loading}>Загрузка информации о точке…</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    if (!point) return null;

    const {
        title,
        id: pointId,
        latitude,
        longitude,
        years,
        text,
        allPhotos,
        allAudio,
    } = point;

    const formattedText = text ? text.replace(/\r\n|\n/g, '<br />') : '';

    const currentPhoto = allPhotos?.[currentPhotoIndex] || null;

    const handleModalOpen = (index) => {
        if (allPhotos.length === 0) return;
        setCurrentPhotoIndex(index);
        setIsModalOpen(true);
    };

    const handleModalClose = () => setIsModalOpen(false);

    const goToPrev = () => {
        if (!allPhotos || allPhotos.length <= 1) return;
        const newIndex = currentPhotoIndex - 1;
        if (newIndex >= 0) setCurrentPhotoIndex(newIndex);
    };

    const goToNext = () => {
        if (!allPhotos || allPhotos.length <= 1) return;
        const newIndex = currentPhotoIndex + 1;
        if (newIndex < allPhotos.length) setCurrentPhotoIndex(newIndex);
    };

    const share = async () => {
        const shareUrl = `${API_URL}/point/${id}`;

        if (navigator.share && window.isSecureContext) {
            try {
                await navigator.share({
                    title: point.title,
                    text: 'Посмотри эту точку:',
                    url: shareUrl,
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка Web Share:', err);
                }
            }
        }

        try {
            console.log('Скопировали')
            await navigator.clipboard.writeText(shareUrl);
            setIsShareSuccess(true);
            console.log('isShareSuccess установлен в true');
            setTimeout(() => setIsShareSuccess(false), 3000);
        } catch (err) {
            console.error('Не удалось скопировать ссылку:', err);
            alert('Не удалось скопировать ссылку. Попробуйте вручную: ' + shareUrl);
        }
    };


    return (
        <main className={styles.pageContainer}>
            <header className={styles.header}>
                <Link to="/" className={styles.backLink}>← Назад к карте</Link>
                <h1 className={styles.title}>{title}</h1>
                {years && <span className={styles.yearsBadge}>{years}</span>}
            </header>

            <section className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.mainPhotoWrapper}>
                        {currentPhoto ? (
                            <img
                                src={`${API_URL}${currentPhoto}`}
                                alt={title}
                                className={styles.mainPhoto}
                                onClick={() => handleModalOpen(currentPhotoIndex)}
                                onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                }}
                            />
                        ) : (
                            <div className={styles.noPhotoPlaceholder}>Нет фото</div>
                        )}
                    </div>

                    {allPhotos && allPhotos.length > 1 && (
                        <div className={styles.galleryThumbs}>
                            {allPhotos.map((photo, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.thumbItem} ${currentPhotoIndex === idx ? styles.active : ''}`}
                                    onClick={() => handleModalOpen(idx)}
                                >
                                    <img
                                        src={`${API_URL}${photo}`}
                                        alt={`Фото ${idx + 1}`}
                                        className={styles.thumbImg}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const placeholder = e.target.nextElementSibling;
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                    />
                                    <div style={{ display: 'none' }} className={styles.thumbPlaceholder}>
                                        Нет фото
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.metaInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>ID:</span>
                            <span className={styles.info}>{pointId}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Координаты:</span>
                            <span className={styles.info}>{latitude}, {longitude}</span>
                        </div>
                        <div className={styles.shareRow}>
                            <button
                                type="button"
                                className={styles.shareBtn}
                                onClick={share}
                                aria-label="Поделиться точкой"
                            >
                                📋 Поделиться точкой
                            </button>

                            {isShareSuccess && (
                                <span className={styles.shareSuccess}>Ссылка скопирована!</span>
                            )}
                        </div>

                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <article className={styles.description}>
                        <h2>Описание</h2>
                        <p dangerouslySetInnerHTML={{ __html: formattedText }} />
                    </article>

                    {allAudio && allAudio.length > 0 && (
                        <section className={styles.audioSection}>
                            <h3>Аудиозаписи</h3>
                            {allAudio.map((audio, idx) => (
                                <div key={idx} className={styles.audioItem}>
                                    <audio controls className={styles.audioPlayer}>
                                        <source src={audio.startsWith('http') ? audio : `${API_URL}${audio}`} type="audio/mpeg" />
                                        Ваш браузер не поддерживает аудио
                                    </audio>
                                    <span className={styles.audioLabel}>Запись {idx + 1}</span>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </section>

            {isModalOpen && currentPhoto && (
                <div className={styles.modalOverlay} onClick={handleModalClose}>
                    {allPhotos.length > 1 && (
                        <button
                            className={styles.navBtn}
                            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            aria-label="Предыдущее фото"
                        >
                            ‹
                        </button>
                    )}

                    <img
                        src={`${API_URL}${currentPhoto}`}
                        alt={title}
                        className={styles.modalImage}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {allPhotos.length > 1 && (
                        <button
                            className={styles.navBtn}
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            aria-label="Следующее фото"
                        >
                            ›
                        </button>
                    )}

                    {allPhotos.length > 1 && (
                        <div className={styles.counter}>
                            {currentPhotoIndex + 1} из {allPhotos.length}
                        </div>
                    )}

                    <button
                        className={styles.closeModalBtn}
                        onClick={handleModalClose}
                        aria-label="Закрыть"
                    >
                        ×
                    </button>
                </div>
            )}
        </main>
    );
};

export default PointPage;