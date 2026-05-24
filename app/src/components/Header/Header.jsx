import React from "react";
import styles from './Header.module.css';
import { IoIosMail } from "react-icons/io";
import { CiLogin, CiLogout } from "react-icons/ci";
import { openLoginForm, setIsLogined } from "../../store/loginSlice";
import { useDispatch, useSelector} from "react-redux";
import { showNotification } from "../../utils/helper";

const Header = () => {
    const dispatch = useDispatch();
    const {isLogined} = useSelector((state) => state.login);

    const login = () =>{
        dispatch(openLoginForm())
    }

    const logout = () => {
         if (window.confirm('Вы уверены, что хотите выйти?')) { 
            dispatch(setIsLogined(false));
            showNotification("Вы вышли", 'success');
            setTimeout(() => window.location.reload(), 1000);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
         }
    }

    return (
        <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
                <span className={styles.title1}>Голос</span>
                <span className={styles.title2}>Крепости</span>
            </div>
            <div className={styles.contact}>
                <a href="mailto:support@thevoiceofthefortress.fun">
                    Связаться с нами
                    <IoIosMail className={styles.mailIcon} />
                </a>
                {!isLogined ? <span className={styles.entry} onClick={login}> 
                    Вход <CiLogin className={styles.entryIcon}/>
                </span> : <span className={styles.entry} onClick={logout}> 
                    Выйти <CiLogout className={styles.entryIcon}/>
                </span>}
            </div>
        </div>
    );
};

export default Header;