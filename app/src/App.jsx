import React from 'react';
import MapPanel from './components/MapPanel/MapPanel';
import EventPanel from './components/EventPanel/EventPanel';
import Gallary from './components/Gallary/Gallary';
import CommentPanel from './components/CommentPanel/CommentPanel';
import PopupPanel from './components/PopupPanel/PopupPanel';
import Header from './components/Header/Header';
import LoginForm from './components/LoginForm/LoginForm';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setIsLogined, setUserDate } from './store/loginSlice';

import "./styles.css"

function App() {

    const VERIFY_API = process.env.REACT_APP_VERIFY_API;
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {

            const token = localStorage.getItem('authToken');
            if (!token) {
                dispatch(setIsLogined(false));
                return;
            }

            try {
                const response = await fetch(VERIFY_API, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Ошибка сервера:', data);
                    dispatch(setIsLogined(false));
                    return;
                }

                if (data.valid === true) {
                    dispatch(setIsLogined(true));
                    dispatch(setUserDate({userId: data.user.userId, username: data.user.username, role: data.user.role}));
                } else {
                    dispatch(setIsLogined(false));
                }

            } catch (error) {
                console.error('Критическая ошибка проверки токена:', error);
                dispatch(setIsLogined(false));
            }
        };

        checkAuth();
    }, [VERIFY_API]);

    return (
        <>
            <Header />
            <div id='mainConteiner'>
                <div id="leftPanel"> 
                    <MapPanel />
                    <Gallary />
                </div>
                <div id="rightPanel"> 
                    <EventPanel />
                </div>
                <PopupPanel />
                <LoginForm />
            </div>
            <CommentPanel />
        </>
    );
}

export default App;
