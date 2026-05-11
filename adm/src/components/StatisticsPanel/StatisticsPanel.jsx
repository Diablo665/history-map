import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './StatisticsPanel.module.css';

const StatisticsPanel = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const STAT_API = process.env.REACT_APP_STAT_API;


    useEffect(() => {
        getStatistics();
    }, []);

    const getStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch(STAT_API);

            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const data = await response.json();
            setStatistics(updateStateInfo(data));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStateInfo = (rawData) => {

        const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalCount = 0;

        rawData.forEach(item => {
            const grade = item.grade;
            if (counts.hasOwnProperty(grade)) {
                counts[grade]++;
                totalCount++;
            }
        });

        const percentages = {};
        Object.keys(counts).forEach(grade => {
            percentages[grade] = totalCount > 0
                ? (counts[grade] / totalCount * 100).toFixed(1)
                : 0;
        });

        let sum = 0;
        rawData.forEach(item => {
            sum += item.grade;
        });
        const average = totalCount > 0 ? (sum / totalCount).toFixed(2) : 0;

        return {
            counts,
            percentages,
            totalCount,
            average
        };
    };

    const getStarText = (grade) => {
        if (grade === 0) return 'Без оценки';

        switch (grade) {
            case 1:
                return `${grade} звезда`;
            case 2:
            case 3:
            case 4:
                return `${grade} звезды`;
            case 5:
                return `${grade} звёзд`;
        }
    };

    if (loading) {
        return (
            <div className={styles.panel}>
                <div className={styles.loading}>Загрузка статистики...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.panel}>
                <div className={styles.error}>Ошибка: {error}</div>
                <button onClick={getStatistics} className={styles.retryButton}>
                    Повторить
                </button>
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>Статистика оценок</h3>

            <div className={styles.summary}>
                <div className={styles.statItem}>
                    <span className={styles.label}>Всего оценок:</span>
                    <span className={styles.value}>{statistics.totalCount}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.label}>Средняя оценка:</span>
                    <span className={styles.averageValue}>
                        {statistics.average} <FaStar size={16} />
                    </span>
                </div>
            </div>

            <div className={styles.gradesDistribution}>
                {[5, 4, 3, 2, 1, 0].map(grade => (
                    <div key={grade} className={styles.gradeRow}>
                        <div className={styles.gradeLabel}>
                            {getStarText(grade)}
                        </div>
                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${statistics.percentages[grade]}%` }}
                            />
                        </div>
                        <div className={styles.gradeCount}>
                            {statistics.counts[grade]} ({statistics.percentages[grade]}%)
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatisticsPanel;