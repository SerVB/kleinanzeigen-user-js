// ==UserScript==
// @name         Kleinanzeigen Date Gatherer
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Gather dates from elements and find the earliest date on Kleinanzeigen
// @author       SerVB
// @match        https://www.kleinanzeigen.de/m-meine-anzeigen.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const updateInterval = 500;

    function parseDate(dateStr) {
        let parts = dateStr.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function findEarliestDate() {
        const elements = document.querySelectorAll('body *');
        let dates = [];

        elements.forEach(element => {
            if (element.textContent) {
                let text = element.textContent;
                let match = text.match(/^Endet am\s+(\d{2}\.\d{2}\.\d{4})$/);
                if (match) {
                    let dateStr = match[1];
                    dates.push(parseDate(dateStr));
                }
            }
        });

        if (dates.length === 0) {
            return null;
        }

        dates.sort((a, b) => a - b);
        return { earliest: dates[0], count: dates.length };
    }

    function updateMeineAnzeigen(info) {
        if (!info) return;

        let meineAnzeigenElement = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(el => el.innerText.includes("Meine Anzeigen"));
        if (meineAnzeigenElement) {
            let earliestDate = `${info.earliest.getDate()}.${info.earliest.getMonth() + 1}.${info.earliest.getFullYear()}`;
            meineAnzeigenElement.innerText = `Meine Anzeigen = ${info.count} gesamt, endet am frühesten am ${earliestDate}`;
        }
    }

    function checkElements() {
        let meineAnzeigenElement = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(el => el.innerText.includes("Meine Anzeigen"));
        let endElements = Array.from(document.querySelectorAll('body *')).filter(el => el.innerText && el.innerText.match(/Endet am\s+(\d{2}\.\d{2}\.\d{4})/));
        return meineAnzeigenElement && endElements.length > 0;
    }

    function runScript() {
        // console.log('Required elements are present. Running script.');
        let info = findEarliestDate();
        // if (info) {
        //     console.log('Info:', info);
        // } else {
        //     console.log('No relevant info found.');
        // }
        updateMeineAnzeigen(info);
        // console.log('Script finished.');
    }

    setInterval(() => {
        if (checkElements()) {
            runScript();
        }
    }, updateInterval);

    console.log('Waiting for required elements to appear.');
})();
