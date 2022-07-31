import DOMParser from "dom-parser";

export default async function handler(req, res) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    try {
        const pageRes = await fetch("https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule");
        const pageContent = await pageRes.text();

        const domParser = new DOMParser();
        const parsedDoc = domParser.parseFromString(pageContent, "text/html");

        const reqToken = parsedDoc.getElementsByName("__RequestVerificationToken")[0].getAttribute("value");

        const reqCookie = pageRes.headers.get("set-cookie").split(";")[0];

        const dateRef = new Date();
        const startTime = `${dateRef.getFullYear()}-${("0" + (dateRef.getMonth() + 1)).slice(-2)}-${("0" + dateRef.getDate()).slice(-2)}`;
        dateRef.setDate(dateRef.getDate() + 1);
        const endTime = `${dateRef.getFullYear()}-${("0" + (dateRef.getMonth() + 1)).slice(-2)}-${("0" + dateRef.getDate()).slice(-2)}`;

        const scheduleRes = await fetch("https://cebcare.ceb.lk/Incognito/GetLoadSheddingEvents", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
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

        res.json(schedule);
    } catch (e) {
        console.error(e);
        res.status(500).json({});
    }
}
