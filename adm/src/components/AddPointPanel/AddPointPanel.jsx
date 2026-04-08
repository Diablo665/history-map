import React, { useState, useEffect } from "react";
import styles from './AddPointPanel.module.css';

const AddPointPanel = ({ mapCoords }) => {

    const API_URL = process.env.REACT_APP_MAIN_API 
    const [formData, setFormData] = useState({
        latitude: '',
        longitude: '',
        title: '',
        description: '',
        year: '',
        photos: [],
        audios: [],
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        if (mapCoords) {
            setFormData(prev => ({
                ...prev,
                latitude: mapCoords.latitude,
                longitude: mapCoords.longitude
            }));
        }
    }, [mapCoords]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            const filesArray = Array.from(files);
            setSelectedFiles(prev => [...prev, ...filesArray]); 

            if (name === 'photos') {
                setFormData((prev) => ({ ...prev, photos: filesArray }));
            } else if (name === 'audios') {
                setFormData((prev) => ({ ...prev, audios: filesArray }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); 

        try {
            const formDataObj = new FormData();

            formDataObj.append('longitude', formData.longitude);
            formDataObj.append('latitude', formData.latitude);
            formDataObj.append('text', formData.description);
            formDataObj.append('title', formData.title);
            formDataObj.append('years', formData.year);

            if (formData.photos && formData.photos.length > 0) {
                formData.photos.forEach((file, i) => {
                    formDataObj.append(`photo[${i}]`, file);
                });
            }

            if (formData.audios && formData.audios.length > 0) {
                formData.audios.forEach((file, i) => {
                    formDataObj.append(`audio[${i}]`, file);
                });
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                body: formDataObj,
            });

            const result = await response.json();

            if (response.ok) {
                alert('Точка добавлена успешно!');

                setFormData({
                    longitude: '',
                    latitude: '',
                    title: '',
                    description: '',
                    year: '',
                    photos: [],
                    audios: []
                });
                setSelectedFiles([]);
            } else {
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            alert('Произошла ошибка при отправке данных.');
        } finally {
            setIsSubmitting(false); 
        }
    };


    const clearSelectedFiles = () => {
        setSelectedFiles([]);
        setFormData(prev => ({
            ...prev,
            photos: [],
            audios: []
        }));
    };

    return (
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="number"
                    name="latitude"
                    placeholder="Широта"
                    value={formData.latitude || ''}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="longitude"
                    placeholder="Долгота"
                    value={formData.longitude || ''}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="title"
                    placeholder="Название"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Описание"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="year"
                    placeholder="Год"
                    value={formData.year}
                    onChange={handleChange}
                />

                <div className="file-upload-wrapper">
                    <label htmlFor="photos" className="file-upload-label">
                        Загрузить фото
                    </label>
                    <input
                        id="photos"
                        type="file"
                        name="photos"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        className="file-upload-input"
                    />
                </div>

                <div className="file-upload-wrapper">
                    <label htmlFor="audios" className="file-upload-label">
                        Загрузить аудио
                    </label>
                    <input
                        id="audios"
                        type="file"
                        name="audios"
                        accept="audio/*"
                        multiple
                        onChange={handleChange}
                        className="file-upload-input"
                    />
                </div>

                {selectedFiles.length > 0 && (
                    <div className={`selected-files ${selectedFiles.length ? 'visible' : ''}`}>
                        <div style={{ fontWeight: 'bold' }}>Выбрано файлов: {selectedFiles.length}</div>
                        <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                            {selectedFiles.map((file, index) => (
                                <li key={index} style={{ fontSize: '0.9rem' }}>
                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={clearSelectedFiles}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Очистить файлы
                        </button>
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Отправка...' : 'Добавить точку'}
                </button>
            </form>
    );
};

export default AddPointPanel;