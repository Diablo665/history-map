import React, { useState } from 'react';
import styles from './AdminPanel.module.css';
import { useSelector, useDispatch} from 'react-redux';
import { closeAdminPanel } from '../../store/adminPopupSlice';
import { showNotification } from '../../utils/helper';
import { removeComment, updateComment } from '../../store/commentsSlice';

const AdminPanel = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const {isOpen, commentId} = useSelector((state) => state.admin);
    const API_URL = process.env.REACT_APP_COMMENT_API;
    const dispatch = useDispatch();

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleConfirm = async () => {
        if (selectedOption === 'complete') {
            try {

                const response = await fetch(`${API_URL}/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }
                dispatch(removeComment(commentId));
                showNotification('Комментарий успешно удалён');
            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
                showNotification('Не удалось удалить комментарий. Пожалуйста, попробуйте ещё раз.', error);
            }

        } else if (selectedOption === 'withComment' && adminComment.trim()) {

            try {
                const response = await fetch(`${API_URL}/${commentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        adminComment: adminComment.trim(),
                    })

                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }
                dispatch(updateComment(adminComment.trim()));
                showNotification('Комментарий успешно удалён');

            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
                showNotification('Не удалось удалить комментарий. Пожалуйста, попробуйте ещё раз.', 'error');
            }
        }

        dispatch(closeAdminPanel())
    };

    if (!isOpen) return null;
    
        
    return (

        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>Удаление комментария</h3>
                    <button 
                        className={styles.closeButton} 
                        onClick={() => dispatch(closeAdminPanel())}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.optionsContainer}>
                    <label
                        className={`${styles.option} ${selectedOption === 'complete' ? styles.selectedOption : ''
                            }`}
                    >
                        <input
                            type="radio"
                            name="deleteOption"
                            value="complete"
                            checked={selectedOption === 'complete'}
                            onChange={() => handleOptionSelect('complete')}
                        />
                        <div className={styles.optionContent}>
                            <div className={styles.optionTitle}>
                                Удалить комментарий полностью
                            </div>
                            <div className={styles.optionDescription}>
                                Выбрав этот способ, комментарий удалится полностью и не будет отображаться на сайте.
                            </div>
                        </div>
                    </label>

                    <label
                        className={`${styles.option} ${selectedOption === 'withComment' ? styles.selectedOption : ''
                            }`}
                    >
                        <input
                            type="radio"
                            name="deleteOption"
                            value="withComment"
                            checked={selectedOption === 'withComment'}
                            onChange={() => handleOptionSelect('withComment')}
                        />
                        <div className={styles.optionContent}>
                            <div className={styles.optionTitle}>
                                Удалить с комментарием
                            </div>
                            <div className={styles.optionDescription}>
                                Выбрав этот способ, на сайте будет отображаться информация следующего типа:
                                "Комментарий был удалён администратором. Комментарий администратора ..."
                            </div>
                            {selectedOption === 'withComment' && (
                                <div className={styles.adminCommentSection}>
                                    <textarea
                                        className={styles.adminCommentInput}
                                        placeholder="Введите комментарий администратора..."
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                    </label>
                </div> 

                <div className={styles.modalFooter}>
                    <button
                        className={styles.cancelButton}
                        onClick={() => dispatch(closeAdminPanel())}
                    >
                        Отмена
                    </button>
                    <button
                        className={`${styles.confirmButton} ${!selectedOption ? styles.disabledButton : ''
                            }`}
                        onClick={handleConfirm}
                        disabled={!selectedOption || (selectedOption === 'withComment' && !adminComment.trim())}
                    >
                        Подтвердить удаление
                    </button>
                </div>
            </div>
        </div>
  );
};

export default AdminPanel;