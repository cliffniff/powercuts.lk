import DOMParser from "dom-parser";

export default async function handler(req, res) {
    const pageRes = await fetch("https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule");

    const pageContent = await pageRes.text();

    const domParser = new DOMParser();
    const parsedDoc = domParser.parseFromString(pageContent, "text/html");

    const reqToken = parsedDoc
        .getElementsByName("__RequestVerificationToken")[0]
        .getAttribute("value");

    const reqCookie = pageRes.headers.get("set-cookie").split(";")[0];

    const letters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];

    const geoAreas = {};

    let index = 0;

    const sendReqs = () => {
        setTimeout(async () => {
            const geoRes = await fetch(
                `https://cebcare.ceb.lk/Incognito/GetLoadSheddingGeoAreas?LoadShedGroupId=${letters[index]}`,
                {
                    headers: {
                        requestverificationtoken: reqToken,
                        cookie: reqCookie,
                    },
                    cache: "no-cache",
                }
            );

            console.log(`Ran ${index + 1} with status ${geoRes.status}`);

            const jsonData = JSON.parse(await geoRes.json());
            geoAreas[letters[index]] = [];

            jsonData.forEach((d) => {
                if (d.FeedingArea) {
                    geoAreas[letters[index]].push(
                        ...d.FeedingArea.split(", ").filter((a) => a.trim() !== "")
                    );
                }
            });

            index++;

            if (index < letters.length) {
                sendReqs();
            } else {
                res.json(geoAreas);
            }
        }, 1000);
    };

    sendReqs();
}
