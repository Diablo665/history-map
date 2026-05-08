import React from "react";
import styles from "./LoginForm.module.css";
import { useState } from "react";

const LoginForm = () => {
    const [loginData, setLoginData] = useState({
        login: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loginApi = process.env.REACT_APP_LOGIN_API;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(loginApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAuthenticated', 'true');
                window.location.reload();
            } else {
                setError(data.error || 'Неверное имя пользователя или пароль');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Произошла ошибка при входе');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.loginFormContainer}>
            <h2>Вход</h2>

            {error && (
                <div className={styles.errorNotification}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {error}
                </div>
            )}

            <form className={styles.loginForm} onSubmit={handleLogin}>
                <input
                    name="login"
                    type="text"
                    placeholder="Логин"
                    onChange={handleChange}
                    required
                    value={loginData.login}
                    className={styles.input}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    onChange={handleChange}
                    required
                    value={loginData.password}
                    className={styles.input}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                >
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;