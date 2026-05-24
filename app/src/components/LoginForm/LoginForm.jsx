
import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setIsRegistration, closeLoginForm, setIsLogined } from '../../store/loginSlice';
import { showNotification } from '../../utils/helper';

const LoginForm = () => {
    const dispatch = useDispatch();
    const {isRegistration, isLoginFormOpen} = useSelector((state) => state.login);
    const REG_API = process.env.REACT_APP_REG_API;
    const LOG_API = process.env.REACT_APP_LOG_API;

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        username: ''
    });

    if (!isLoginFormOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = isRegistration ? REG_API : LOG_API;
            const data = isRegistration
                ? {
                    username: formData.username.trim(),
                    login: formData.login.trim(),
                    password: formData.password
                }
                : {
                    login: formData.login.trim(),
                    password: formData.password
                };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                setFormData(isRegistration
                    ? { login: '', password: '', username: '' }
                    : { login: '', password: '' }
                );

                showNotification(
                    isRegistration ? 'Вы зарегистрированы' : 'Вы вошли',
                    'success'
                );

                if(!isRegistration){
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('userData', JSON.stringify(result.user));

                    setTimeout(() => window.location.reload(), 1000)

                    
                    dispatch(setIsLogined(true));

                }
            } else {
                showNotification(`Ошибка: ${result.error}`, 'error')
            }
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            showNotification('Произошла ошибка при отправке данных.', 'error')
        }
    };

    const toggleMode = () => {
        dispatch(setIsRegistration(!isRegistration));
    };

    const close = () => {
        dispatch(closeLoginForm())
    }

    return (
        <div className={styles.overlay} onClick={close}>
            <div className={styles.formContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    {isRegistration ? 'Регистрация' : 'Вход'}
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {isRegistration ? <div className={styles.inputBlock}>
                        <label htmlFor="username">Имя:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div> : ''}

                    <div className={styles.inputBlock}>
                        <label htmlFor="login">Логин:</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputBlock}>
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                    >
                        {isRegistration ? 'Зарегистрироваться' : 'Войти'}
                    </button>

                    <div className={styles.switchBlock}>
                        <button
                            type="button"
                            className={styles.switchBtn}
                            onClick={toggleMode}
                        >
                            {isRegistration
                                ? 'Уже есть аккаунт? Войти'
                                : 'Ещё нет аккаунта? Зарегистрируйтесь'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default LoginForm;