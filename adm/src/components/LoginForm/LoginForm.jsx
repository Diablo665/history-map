import React from "react"; 
import styles from "./LoginForm.module.css";
import { useState } from "react";

const LoginForm = () => {
    const [loginData, setLoginData] = useState({
        login: '',
        password: '',
    })

    const loginApi = process.env.REACT_APP_LOGIN_API 

    const logined = async (e) => {
        e.preventDefault();
        
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
                alert('Ошибка регистрации: ' + data.error);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации');
        }
        
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div id={styles.loginFormConteiner}> 
            <h2> Вход </h2>
            <form id={styles.loginForm} onSubmit={logined}> 
                <input 
                    name="login"
                    type="text"
                    placeholder="Логин"
                    onChange={handleChange}
                    required

                /> 

                <input 
                    name="password"
                    type="password" 
                    placeholder="Пароль"
                    onChange={handleChange}
                    required
                /> 

                <button type="submit"> 
                    Войти 
                </button>
            </form> 
        </div>

    )
}

export default LoginForm