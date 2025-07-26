// ==UserScript==
// @name         Kleinanzeigen Date Gatherer
// @namespace    http://tampermonkey.net/
// @version      1.10
// @description  Gather dates from elements and find the earliest date on Kleinanzeigen
// @author       SerVB
// @match        https://www.kleinanzeigen.de/m-meine-anzeigen.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const updateInterval = 500;

    function parseDate(dateStr) {
        const parts = dateStr.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function findEarliestDate() {
        const elements = Array.from(document.getElementsByTagName("div"));
        const dates = [];

        elements.forEach(element => {
            if (element.textContent) {
                const text = element.textContent;
                const match = text.match(/^Endet am\s+(\d{2}\.\d{2}\.\d{4})$/);
                if (match) {
                    const dateStr = match[1];
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

        const meineAnzeigenElement = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(el => el.innerText.includes("Meine Anzeigen"));
        if (meineAnzeigenElement) {
            const earliestDate = `${info.earliest.getDate()}.${info.earliest.getMonth() + 1}.${info.earliest.getFullYear()}`;
            meineAnzeigenElement.innerText = `Meine Anzeigen = ${info.count} gesamt, endet am frühesten am ${earliestDate}`;

            meineAnzeigenElement.parentElement.style["max-width"] = "100%";
        }

        Array.from(document.getElementsByTagName("button")).forEach(button => {
            if (button.textContent) {
                let text = button.textContent;
                let match = text.match(/^Verlängern$/);
                if (match) {
                  button.classList.add("verlängern");
                }
            }
        });
    }

    function checkElements() {
        // todo: is it even needed to check?
        const meineAnzeigenElement = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(el => el.innerText.includes("Meine Anzeigen"));
        const endElements = Array.from(document.getElementsByTagName("div")).filter(el => el.innerText && el.innerText.match(/^Endet am\s+(\d{2}\.\d{2}\.\d{4})$/));
        return meineAnzeigenElement && endElements.length > 0;
    }

    function runScript() {
        const info = findEarliestDate();
        updateMeineAnzeigen(info);
    }

    setInterval(() => {
        if (checkElements()) {
            runScript();
        }
    }, updateInterval);

    console.log('Waiting for required elements to appear.');

    const verlaengernStyle = document.createElement('style');
    verlaengernStyle.textContent = `
      button[aria-disabled="false"].verlängern {
        background: pink !important;
      }
    `;
    document.head.appendChild(verlaengernStyle);
})();
