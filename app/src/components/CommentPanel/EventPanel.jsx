import React from "react";
import styles from "./EventPanel.module.css"

const EventPanel = () => {

    const testCounter = 1;

    return (
        <div id={styles.eventPanel}> 
            <h3> Поледнии события: </h3>
            {testCounter === 0 ?  <div id={styles.noEventBlock}> Нет новых событий </div> 

                : 

                <>
                <div className={styles.eventBlock}> 
                    <img src="https://static.tildacdn.com/stor3632-6331-4263-b262-666333346564/53487197.png" className={styles.eventImg} alt="Картинка"/>
                    <div className={styles.eventInfo}> 
                        <span className={styles.eventTitle}> Добавлено новое место </span>
                        <div className={styles.eventText}> Тест, тест, тест, тест, тест, тест, тест, тест, тест, Тест, тест, тест, тест, тест, тест, тест, тест, тест, Тест, тест, тест, тест, тест, тест, тест, тест, тест, Тест, тест, тест, тест, тест, тест, тест, тест, тест, Тест, тест, тест, тест, тест, тест, тест, тест, тест Тест, тест, тест, тест, тест, тест, тест, тест, тест Тест, тест, тест, тест, тест, тест, тест, тест, тестТест, тест, тест, тест, тест, тест, тест, тест, тест </div>
                    </div>
                </div>
                <div className={styles.eventBlock}> 
                    <img src="https://static.tildacdn.com/stor3632-6331-4263-b262-666333346564/53487197.png" className={styles.eventImg} alt="Картинка"/>
                </div>
                <div className={styles.eventBlock}> 
                    <img src="https://static.tildacdn.com/stor3632-6331-4263-b262-666333346564/53487197.png" className={styles.eventImg} alt="Картинка"/>
                </div>
                <div className={styles.eventBlock}> 
                    <img src="https://static.tildacdn.com/stor3632-6331-4263-b262-666333346564/53487197.png" className={styles.eventImg} alt="Картинка"/>
                </div>
                </>
            }
        </div>
    )
}

export default EventPanel