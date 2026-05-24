import React, { useState, useEffect } from 'react';
import styles from './CommentPanel.module.css';
import { FaRegStar, FaStar } from "react-icons/fa";
import { formatDate } from '../../utils/helper';
import { useSelector, useDispatch } from 'react-redux';
import { openAdminPanel, setCommentId } from '../../store/adminPopupSlice';

const CommentPanel = () => {
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(null);
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = process.env.REACT_APP_COMMENT_API;

    const dispatch = useDispatch();
    const { userId, username, isLogined, role } = useSelector((state) => state.login)

    useEffect(() => {

        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                setComments(result);
                setLoading(false);
            })
            .catch(error => {
                console.error('Ошибка загрузки комментариев:', error);
                setLoading(false);
            });
    }, [API_URL])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogined) {
            alert("Для того чтобы оставить комментарий, нужно зарегестрироваться")
            return
        }
        if (!comment.trim()) {
            alert('Пожалуйста, заполните комментарий');
            return;
        }

        const commentName = role === "admin" ? name : username;

        setIsSubmitting(true);

        try {

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: commentName,
                    comment: comment.trim(),
                    datetime: new Date().toISOString(),
                    grade: rating,
                    userid: userId,
                })
            });

            const result = await response.json();

            if (response.ok) {
                setComment('');
                setRating(0);
                setComments([result, ...comments]);
                setName('')
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
    const handleStarClick = (starValue) => {
        setRating(starValue);
    };

    const handleStarHover = (starValue) => {
        setHoverRating(starValue);
    };

    const handleMouseLeave = () => {
        setHoverRating(null);
    };

    const handleResetRating = () => {
        setRating(0);
    };

    const handleDeleteComment = async (commentId) => {
        
        if (role === 'admin'){
            dispatch(openAdminPanel())
            dispatch(setCommentId(commentId))
            return
        }

        if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            try {
                console.log('Удаляем комментарий:', commentId);

                const response = await fetch(`${API_URL}/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }

                setComments(prevComments =>
                    prevComments.filter(comment => comment.id !== commentId)
                );

                alert('Комментарий успешно удалён');
            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
                alert('Не удалось удалить комментарий. Пожалуйста, попробуйте ещё раз.');
            }
        }
    };

    return (
        <div className={styles.commentPanel}>
            <h3>Комментарии</h3>
            {isLogined ?
                <form onSubmit={handleSubmit} className={styles.commentForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Имя:</label>
                        {role === 'admin' ? <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите ваше имя"
                            maxLength={50}
                            required
                        /> : 
                        <input
                            type="text"
                            id="name"
                            value={username}
                            placeholder="Введите ваше имя"
                            maxLength={50}
                            readOnly
                        />}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Оценка:</label>
                        <div
                            className={styles.starsContainer}
                            onMouseLeave={handleMouseLeave}
                        >
                            {[1, 2, 3, 4, 5].map((starValue) => (
                                <button
                                    type='button'
                                    key={starValue}
                                    className={styles.starButton}
                                    onClick={() => handleStarClick(starValue)}
                                    onMouseEnter={() => handleStarHover(starValue)}
                                >
                                    {starValue <= (hoverRating ?? rating) ? (
                                        <FaStar className={styles.filledStar} />
                                    ) : (
                                        <FaRegStar className={styles.emptyStar} />
                                    )}
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <button
                                type="button"
                                className={styles.resetButton}
                                onClick={handleResetRating}
                            >
                                Сбросить оценку
                            </button>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="comment">Комментарий:</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Напишите ваш комментарий"
                            rows={4}
                            maxLength={500}
                            required

                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
                    </button>
                </form>

                : <h4 className={styles.notLogin}> Войдите в профиль чтобы оставить комментарий </h4>}

            <div className={styles.commentsList}>
                {comments.length === 0 ? (
                    <p className={styles.noComments}>Пока нет комментариев</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={styles.commentItem}>
                            <div className={styles.commentAvatar}>
                                <img
                                    src="https://thevoiceofthefortress.fun/images/avatar.png"
                                    alt={`Аватар пользователя ${comment.name}`}
                                    onError={(e) => {
                                        e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyOCIgY3k9IjI4IiByPSIyOCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjI4IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QTwvL3RleHQ+PC9zdmc+`;
                                    }}
                                />
                            </div>
                            <div className={styles.commentContent}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentName}>{comment.isDeleted ? 'Пользователь' : comment.username}</span>
                                    <span className={styles.commentDate}>{formatDate(comment.datetime)}</span>
                                </div>

                                {comment.grade >= 0 && (
                                    <div className={styles.commentRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={
                                                    star <= comment.grade
                                                        ? styles.filledStar
                                                        : styles.emptyStar
                                                }
                                            />
                                        ))}
                                    </div>
                                )}

                                <p className={
                                    comment.isDeleted
                                        ? `${styles.commentText} ${styles.deletedComment}`
                                        : styles.commentText
                                }>{comment.isDeleted ? (
                                        <>
                                            Комментарий был удалён администратором.
                                                <span className={styles.adminComment}>
                                                    <br /><strong>Комментарий администратора:</strong> {comment.comment}
                                                </span>
                                        </>
                                    ) : (
                                        comment.comment
                                    )}</p>

                                {comment.userid === userId || role === 'admin' ? <div className={styles.commentActions}>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteComment(comment.id)}
                                    >
                                        Удалить
                                    </button>
                                </div> : ''}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentPanel;