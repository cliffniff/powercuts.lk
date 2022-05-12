import { useState, useEffect } from "react";
import { MdError } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";

import Head from "next/head";

import Group from "../components/Group";
import Navbar from "../components/Navbar";

import styles from "../styles/Home.module.css";

export default function Home() {
    const [highlighted, setHighlighted] = useState();
    const [schedule, setSchedule] = useState();
    const [geoAreas, setGeoAreas] = useState();

    const [error, setError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const pageRes = await fetch("https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule", {
                    headers: {
                        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "max-age=0",
                        "sec-ch-ua":
                            '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"Windows"',
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        cookie: ".AspNetCore.Antiforgery.ThOcTlhnrMo=CfDJ8DRug-ybtbxAjw2fB8wdOCMYADRkPoS0OP2J41DsQ8yKYk7dGhQYARk-MdPz_dF0kIjLp5v6gpNVGwWCZgHy1j-bLZBvIDm1-zAgJvbj0bd4nC9pj-_DydARTKDDEg8U9S6VUU7oQhRW9HGmqVmsJN8",
                    },
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: null,
                    method: "GET",
                });
                const pageContent = await pageRes.text();

                const domParser = new DOMParser();
                const parsedDoc = domParser.parseFromString(pageContent, "text/html");

                const reqToken = parsedDoc
                    .getElementsByName("__RequestVerificationToken")[0]
                    .getAttribute("value");

                const reqCookie = pageRes.headers.get("set-cookie").split(";")[0];

                const dateRef = new Date();
                const startTime = `${dateRef.getFullYear()}-${
                    dateRef.getMonth() + 1
                }-${dateRef.getDate()}`;
                dateRef.setDate(dateRef.getDate() + 1);
                const endTime = `${dateRef.getFullYear()}-${
                    dateRef.getMonth() + 1
                }-${dateRef.getDate()}`;

                const scheduleRes = await fetch(
                    "https://cebcare.ceb.lk/Incognito/GetLoadSheddingEvents",
                    {
                        headers: {
                            requestverificationtoken: reqToken,
                            cookie: reqCookie,
                        },
                        cache: "no-cache",
                        body: `StartTime=${startTime}&EndTime=${endTime}`,
                        method: "POST",
                    }
                );

                const scheduleData = await scheduleRes.json();
                const schedule = {};

                scheduleData.forEach((item) => {
                    const gid = item.loadShedGroupId;
                    const stime = item.startTime.replace("T", " ");
                    const etime = item.endTime.replace("T", " ");

                    if (schedule[gid] === undefined) {
                        schedule[gid] = [{ startTime: stime, endTime: etime }];
                    } else {
                        schedule[gid].push({ startTime: stime, endTime: etime });
                    }
                });

                const geoRes = await fetch("/geoAreas.json");
                const geoAreas = await geoRes.json();

                setSchedule(schedule);
                setGeoAreas(geoAreas);
            } catch (e) {
                console.error(e);
                setError(true);
            }
        })();
    }, []);

    return (
        <div>
            <Head>
                <title>powercuts.lk</title>
                <meta name="description" content="View the powercut schedule given by the CEB" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {schedule && geoAreas ? (
                <div className={styles.container}>
                    <Navbar geoAreas={geoAreas} setHighlighted={setHighlighted} />
                    <div className={styles.groups}>
                        {Object.entries(schedule).map(([gid, timings], index) => {
                            const areas = geoAreas[gid];

                            return (
                                <Group
                                    key={index}
                                    gid={gid}
                                    areas={areas}
                                    timings={timings}
                                    highlighted={highlighted}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className={styles.suspense}>
                    {error ? (
                        <div className={styles["suspense-error"]}>
                            <MdError size="3em" color="rgb(182, 58, 58)" />
                            <h5>Something went wrong!</h5>
                            <h5>Try again in a few minutes.</h5>
                            <i>powercuts.lk</i>
                        </div>
                    ) : (
                        <div className={styles["suspense-loading"]}>
                            <CgSpinner
                                className={styles["suspense-loading-spinner"]}
                                size="2em"
                                color="rgb(10, 88, 165)"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
