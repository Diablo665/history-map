
import React, { useState } from 'react';
import styles from './EditCommentPanel.module.css';
import { showNotification } from '../../utils/helper';

export const EditCommentPanel = ({ isOpen, comment, onSave, onClose }) => {

    const initialText = comment?.comment ?? '';
    const initialGrade = comment?.grade ?? null;

    const [text, setText] = useState(initialText);
    const [grade, setGrade] = useState(initialGrade);

    const COMMENT_API = process.env.REACT_APP_COMMENT_API;

    if (!isOpen || !comment) return null;

    const editComment = (id, newText, newGrade) => {

        try{
            fetch(`${COMMENT_API}/${id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newComment: newText, newGrade: newGrade})
            })

            .then((res) => {
                if(res.ok){
                    showNotification('Комментарий успешно изменён', 'success');
                    onClose();
                }
            })
        }catch(err){
            console.error('Ошибка => ', err);
            showNotification('Произошла ошибка при изменении данный', 'error');
        }

    }



    const handleSave = async () => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            showNotification('Поле комментария не может быть пустым', 'error');
            return;
        };
        editComment(comment.id, trimmedText, grade);
    };

    const isNoGradeSelected = grade === null;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.editCommentModal}`}>
                <header className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Редактировать комментарий</h3>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </header>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Текст комментария</label>
                    <textarea
                        className={styles.formInput}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        placeholder="Напишите, что хотите изменить…"
                        autoFocus
                    />
                </div>

                <fieldset className={styles.ratingFieldset}>
                    <legend className={styles.formLabel}>Оценка (0–5)</legend>
                    <div className={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = grade !== null && star <= grade;
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    className={`${styles.starBtn} ${isFilled ? styles.starFilled : styles.starEmpty}`}
                                    onClick={() => setGrade(star)}
                                    aria-label={`Поставить ${star} звезду`}
                                >
                                    ★
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            className={`${styles.starBtn} ${styles.noGradeBtn} ${isNoGradeSelected ? styles.noGradeActive : ''}`}
                            onClick={() => setGrade(null)}
                            aria-label="Убрать оценку"
                        >
                            ✕
                        </button>
                    </div>
                    <span className={styles.hintText}>
                        {grade === null ? 'Оценка не поставлена' : `${grade} из 5`}
                    </span>
                </fieldset>

                <div className={styles.modalActions}>
                    <button type="button" className={styles.btnSecondary} onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleSave}
                        disabled={!text.trim()}
                    >
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};