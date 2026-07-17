import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import styles from './UserProfile.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setIsLogined } from '../../store/loginSlice';
import { showNotification } from '../../utils/helper';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import { EditCommentPanel } from '../../components/EditCommentPanel/EditCommentPanel';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('comments');
    const [isNameEdit, setIsNameEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newName, setNewName] = useState('');
    const [userData, setUserData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCommentData, setEditCommentData] = useState(null)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const COMMENT_API = process.env.REACT_APP_COMMENT_API;

    const API_URL = process.env.REACT_APP_USER_API;

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        })
            .then((res) => {
                if (res.status === 401) {
                    setError('401');
                    return Promise.reject(new Error('Unauthorized'));
                }

                if (res.status === 403) {
                    setError('403');
                    return Promise.reject(new Error('Forbidden'));
                }

                if (!res.ok) {
                    setError('500');
                    return Promise.reject(new Error(`Server error: ${res.status}`));
                }

                return res.json();
            })
            .then((data) => {
                setUserData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);

                setLoading(false);
            });
    }, [id, API_URL]);

    const { isLogined } = useSelector((state) => state.login);

    if (!isLogined) {
        return <div className={styles.unauthorized}>Войдите в профиль</div>;
    }

    if (loading) {
        return <Loading size='large' />;
    }

    if (error) {
        let text = '';
        switch (error) {
            case '401':
                text = 'Ошибка: сессия истекла. Пожалуйста, войдите снова.';
                break;
            case '403':
                text = 'Ошибка: нельзя просматривать чужой профиль.';
                break;
            default:
                text = 'Ошибка сервера. Попробуйте позже.';
                break;
        }

        return (
            <div className={styles.error}>
                <p>{text}</p>
                {error === '401' && (
                    <button onClick={() => navigate('/login')} className={styles.btnPrimary}>
                        Войти
                    </button>
                )}
                {error === '403' && (
                    <button onClick={() => navigate('/')} className={styles.btnSecondary}>
                        На главную
                    </button>
                )}
            </div>
        );
    }

    if (!userData) {
        return <div className={styles.error}>Нет данных профиля.</div>;
    }

    const updateName = () => {

        try {
            fetch(`${API_URL}/update-name/${id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newName: newName })
            })
                .then((res) => {
                    if (res.ok) {

                        setUserData((prev) => ({
                            ...prev,
                            user: {
                                ...prev.user,
                                username: newName,
                            },
                        }));

                        setNewName('');
                        showNotification('Имя изменено', 'success');
                        setIsNameEdit(false);

                    }
                })
        } catch (err) {
            showNotification(`Ишибка при изменении данные: ${err}`, 'error');

        }

    };

    const handleDeleteProfile = () => {
        try {
            fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            })
                .then((res) => {
                    if (res.ok) {

                        setIsDeleteModalOpen(false);
                        setDeleteConfirmText('');
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        showNotification(
                            'Профиль успешно удалён, вы будете перенаправлены на главную страницу через несколько секунд',
                            'success'
                        );
                        setTimeout(() => {
                            navigate('/');
                            dispatch(setIsLogined(false))
                        },
                            2000);
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        } catch (err) {
            console.error(err)
        }

    };

    const handleDeleteComment = async (commentId) => {

        if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            try {

                const response = await fetch(`${COMMENT_API}/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }

                showNotification('Комментарий успешно удалён');
            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
                showNotification('Не удалось удалить комментарий. Пожалуйста, попробуйте ещё раз.', 'error');
            }
        }
    };

    const updatePassword = (e) => {
        e.preventDefault();

        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            showNotification('Заполните все поля', 'error')
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error')
            return;
        }

        try {

            fetch(`${API_URL}/update-password/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    lastPassword: currentPassword,
                    newPassword: newPassword
                }),
            })
            .then((res) => {
                if(res.ok){
                    showNotification('Парол изменен', 'success')
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    
                }
            })

        } catch (err) {
            console.error(err);

        }
    }

    const handleToggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
        setDeleteConfirmText('');
    };

    const editCommentToggle = (id, commentText, grade) => {
        setEditCommentData({ comment: commentText, grade: grade, id: id });
        setIsEditModalOpen(true)

    }

    const user = userData.user;
    const stats = userData.stats || { totalComments: 0, totalGrades: 0 };
    const comments = userData.comments || [];

    return (
        <div className={styles.profilePage}>
            <Header from="profile" />

            <main className={styles.profileContainer}>
                <section className={styles.heroSection}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatarPlaceholder}>
                            <span className={styles.initials}>
                                {user?.username?.[0]?.toUpperCase() ?? '?'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.heroContent}>
                        <div className={styles.nameRow}>
                            {!isNameEdit ? (
                                <>
                                    <h1 className={styles.userName}>{user?.username ?? 'Пользователь'}</h1>
                                    <button
                                        className={styles.editNameBtn}
                                        title="Изменить имя"
                                        onClick={() => setIsNameEdit(!isNameEdit)}
                                    >
                                        ✎
                                    </button>
                                </>
                            ) : (
                                <div className={styles.nameInputGroup}>
                                    <input
                                        className={styles.userNameInput}
                                        placeholder="Введите имя"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        className={styles.saveNewName}
                                        title="Сохранить"
                                        onClick={updateName}
                                    >
                                        ✅
                                    </button>
                                    <button
                                        className={styles.cancelEditBtn}
                                        onClick={() => setIsNameEdit(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Оценки</span>
                                <strong className={styles.statNumber}>{stats.totalGrades}</strong>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Комментарии</span>
                                <strong className={styles.statNumber}>{stats.totalComments}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.profileContent}>
                    <div className={styles.settingsPanel}>
                        <h3 className={styles.panelTitle}>Безопасность</h3>
                        <form className={styles.passwordForm} onSubmit={updatePassword}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Текущий пароль</label>
                                <input
                                    type="password"
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Новый пароль</label>
                                <input
                                    type="password"
                                    className={styles.formInput}
                                    placeholder="Придумайте новый пароль"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Подтверждение пароля</label>
                                <input
                                    type="password"
                                    className={styles.formInput}
                                    placeholder="Повторите новый пароль"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className={styles.btnPrimary}>
                                Сохранить изменения
                            </button>
                        </form>
                    </div>

                    <div className={styles.activityPanel}>
                        <h3 className={styles.panelTitle}>Активность на сайте</h3>
                        <div className={styles.activityTabs}>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'comments' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                Комментарии
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'ratings' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('ratings')}
                            >
                                Оценки
                            </button>
                        </div>

                        {activeTab === 'comments' && (
                            <div className={styles.feedList}>
                                {comments.length === 0 ? (
                                    <p className={styles.emptyFeed}>Комментариев пока нет.</p>
                                ) : (
                                    comments.map((c, idx) => (
                                        <div key={idx} className={styles.feedCard}>
                                            <div className={styles.feedHeader}>
                                                <span className={styles.feedDate}>
                                                    {new Date(c.datetime).toLocaleDateString('ru-RU')}
                                                </span>
                                                <span className={styles.feedLocation}>
                                                    {c.pointId === null
                                                        ? <span> Основной сайт </span>
                                                        : <a href={`https://thevoiceofthefortress.fun/point/${c.pointId}`} className={styles.pointHref}>
                                                            {c.pointTitle}
                                                        </a>}
                                                </span>
                                            </div>
                                            <p className={styles.feedText}>{c.comment}</p>
                                            <div className={styles.feedActions}>
                                                <button className={styles.btnAction} onClick={() => { editCommentToggle(c.commentId, c.comment, c.grade) }}>Редактировать</button>
                                                <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => handleDeleteComment(c.commentId)}>
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {activeTab === 'ratings' && (
                            <div className={styles.feedList}>
                                {stats.totalGrades === 0 ? (
                                    <p className={styles.emptyFeed}>Оценок пока нет.</p>
                                ) : (
                                    comments.map((c, idx) => {
                                        const stars = Math.max(0, Math.min(5, c.grade));

                                        return (
                                            <div key={idx} className={styles.ratingCard}>
                                                <div className={styles.ratingHeader}>
                                                    <span className={styles.feedDate}>
                                                        {new Date(c.datetime).toLocaleDateString('ru-RU')}
                                                    </span>
                                                    <span className={styles.feedLocation}>
                                                        {c.pointId === null
                                                            ? <span> Основной сайт </span>
                                                            : <a href={`https://thevoiceofthefortress.fun/point/${c.pointId}`} className={styles.pointHref}>
                                                                {c.pointTitle}
                                                            </a>}
                                                    </span>
                                                </div>

                                                <div className={styles.starsRow}>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <span
                                                            key={i}
                                                            className={i <= stars ? styles.starFilled : styles.starEmpty}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>

                                                {c.comment && (
                                                    <div className={styles.ratingMeta}>
                                                        <span className={styles.hasCommentTag}>Есть комментарий</span>
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.dangerPanel}>
                    <h3 className={styles.panelTitle}>Управление профилем</h3>
                    <div className={styles.dangerContent}>
                        <p className={styles.dangerDesc}>
                            Здесь вы можете полностью удалить свой профиль и все связанные с ним данные.
                        </p>
                        <button className={styles.btnDangerAction} onClick={handleToggleDeleteModal}>
                            Удалить профиль
                        </button>
                    </div>
                </div>

                {isDeleteModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3 className={styles.modalTitle}>Вы уверены?</h3>
                            <p className={styles.modalText}>
                                Вы собираетесь удалить свой профиль. После этого действия восстановить его будет невозможно.
                                Все ваши оценки и комментарии останутся.
                            </p>
                            <p className={styles.modalWarning}>
                                Для подтверждения введите слово <strong>"УДАЛИТЬ"</strong> в поле ниже:
                            </p>
                            <input
                                type="text"
                                className={styles.modalInput}
                                placeholder="Введите УДАЛИТЬ"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                            />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={handleToggleDeleteModal}>
                                    Отмена
                                </button>
                                <button
                                    className={`${styles.btnDangerAction} ${deleteConfirmText === 'УДАЛИТЬ' ? styles.btnDangerActive : styles.btnDangerDisabled
                                        }`}
                                    onClick={handleDeleteProfile}
                                    disabled={deleteConfirmText !== 'УДАЛИТЬ'}
                                >
                                    Подтвердить удаление
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isEditModalOpen && <EditCommentPanel
                    isOpen={isEditModalOpen}
                    comment={editCommentData}
                    onClose={() => setIsEditModalOpen(false)}
                />}
            </main>
        </div>
    );
};

export default UserProfile;