import { useState, useEffect } from "react";
import Head from "next/head";

import fs from "fs/promises";
import DOMParser from "dom-parser";

import Group from "../components/Group";
import Navbar from "../components/Navbar";

import styles from "../styles/Home.module.css";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

export const getServerSideProps = async () => {
    try {
        const pageRes = await fetch("https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule");
        const pageContent = await pageRes.text();

        const domParser = new DOMParser();
        const parsedDoc = domParser.parseFromString(pageContent, "text/html");

        const reqToken = parsedDoc
            .getElementsByName("__RequestVerificationToken")[0]
            .getAttribute("value");

        const reqCookie = pageRes.headers.get("set-cookie").split(";")[0];

        const dateRef = new Date();
        const startTime = `${dateRef.getFullYear()}-${dateRef.getMonth() + 1}-${dateRef.getDate()}`;
        dateRef.setDate(dateRef.getDate() + 1);
        const endTime = `${dateRef.getFullYear()}-${dateRef.getMonth() + 1}-${dateRef.getDate()}`;

        const scheduleRes = await fetch("https://cebcare.ceb.lk/Incognito/GetLoadSheddingEvents", {
            headers: {
                requestverificationtoken: reqToken,
                cookie: reqCookie,
            },
            cache: "no-cache",
            body: `StartTime=${startTime}&EndTime=${endTime}`,
            method: "POST",
        });

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

        const geoAreas = JSON.parse(await fs.readFile(process.cwd() + "/data/geoAreas.json"));

        return {
            props: { schedule, geoAreas },
        };
    } catch (e) {
        console.error(e);
        return {
            props: { schedule: null, geoAreas: null },
        };
    }
};

export default function Home({ schedule, geoAreas }) {
    const [highlighted, setHighlighted] = useState("");

    return (
        <div>
            <Head>
                <title>powercuts.lk</title>
                <meta name="description" content="View the powercut schedule given by the CEB" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.container}>
                <Navbar geoAreas={geoAreas} setHighlighted={setHighlighted} />
                <div className={styles.groups}>
                    {schedule && geoAreas ? (
                        Object.entries(schedule).map(([gid, timings], index) => {
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
                        })
                    ) : (
                        <div className={styles.error}>
                            <h3>Something went wrong!</h3>
                            <p>Please try again in few minutes!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
