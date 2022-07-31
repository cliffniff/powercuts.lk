import React, { useEffect, useState } from "react";
import styles from "../styles/Group.module.css";

const Group = ({ gid, areas, timings, highlighted }) => {
    const [orgedTimings, setOrgedTimings] = useState(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const tempTimings = {};

        timings.forEach((timing) => {
            const date = new Date(timing.startTime).toDateString();

            if (!tempTimings[date]) {
                tempTimings[date] = [timing];
            } else {
                tempTimings[date].push(timing);
            }

            const startTime = new Date(timing.startTime).valueOf();
            const endTime = new Date(timing.endTime).valueOf();

            if (startTime < Date.now() > endTime) {
                setActive(true);
            }
        });

        setOrgedTimings(tempTimings);
    }, [timings]);

    return (
        <div id={`group${gid}`} className={highlighted === gid ? styles.group + " " + styles["group-highlighted"] : styles.group}>
            <h1 className={styles["group-title"]}>
                <small>GROUP</small> {gid}
            </h1>
            {active && <span className={styles["group-active"]}>Active</span>}
            <span className={styles["group-areas"]}>{areas.join(", ")}</span>
            <div className={styles["group-timings"]}>
                {orgedTimings &&
                    Object.entries(orgedTimings)
                        .sort(([firstDate], [secondDate]) => {
                            if (new Date(firstDate).getTime() > new Date(secondDate).getTime()) {
                                return -1;
                            }
                            return 1;
                        })
                        .map(([date, timings], index) => {
                            return (
                                <div key={index} className={styles["group-timing"]}>
                                    <h5 className={styles["group-timing-date"]}>{date}</h5>
                                    <ul className={styles["group-timing-list"]}>
                                        {timings.map((timing, index) => {
                                            const startTime = new Date(timing.startTime).toLocaleTimeString();
                                            const endTime = new Date(timing.endTime).toLocaleTimeString();

                                            return (
                                                <li key={index}>
                                                    {startTime} - {endTime}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
            </div>
        </div>
    );
};

export default Group;
