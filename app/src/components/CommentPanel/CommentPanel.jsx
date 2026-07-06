import React, { useState, useEffect } from 'react';
import styles from './CommentPanel.module.css';
import { FaRegStar, FaStar } from "react-icons/fa";
import { formatDate, showNotification } from '../../utils/helper';
import { useSelector, useDispatch } from 'react-redux';
import { openAdminPanel, setCommentId } from '../../store/adminPopupSlice';
import { fetchComments, removeComment, addComment } from '../../store/commentsSlice';

const CommentPanel = ({from, pointId}) => {
    
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAIN_API_URL = process.env.REACT_APP_COMMENT_API;
    const GET_API_URL = from === 'point' ? `${process.env.REACT_APP_COMMENT_API}/${pointId}` : process.env.REACT_APP_COMMENT_API;
    const dispatch = useDispatch();
    const { userId, username, isLogined, role } = useSelector((state) => state.login);
    const {comments, isLoading, error} = useSelector((state) => state.comments)

    useEffect(() => {

        dispatch(fetchComments(GET_API_URL))

    }, [GET_API_URL])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogined) {
            showNotification("Для того чтобы оставить комментарий, нужно зарегестрироваться", 'error');
            return
        }
        if (!comment.trim()) {
            showNotification('Пожалуйста, заполните комментарий', 'error');
            return;
        }

        const commentName = role === "admin" ? name : username;

        setIsSubmitting(true);

        try {

            const data = from === 'point'
                ? {
                    username: commentName,
                    comment: comment.trim(),
                    datetime: new Date().toISOString(),
                    grade: rating,
                    userid: userId,
                    pointId: pointId
                }
                : {
                    username: commentName,
                    comment: comment.trim(),
                    datetime: new Date().toISOString(),
                    grade: rating,
                    userid: userId,
                };

            const response = await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                dispatch(addComment(result))
                setComment('');
                setRating(0);
                setName('')
            } else {
                showNotification(`Ошибка: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            showNotification('Произошла ошибка при отправке данных.', 'error');
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

                const response = await fetch(`${MAIN_API_URL}/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }

                dispatch(removeComment(commentId))
                showNotification('Комментарий успешно удалён');
            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
                showNotification('Не удалось удалить комментарий. Пожалуйста, попробуйте ещё раз.', 'error');
            }
        }
    };

    if(isLoading){
         return (
            <div> Загрузка комментаиев </div>
        )
    }

    if(error){
        return (
            <div> Ошибка загрузки </div>
        )
    }

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