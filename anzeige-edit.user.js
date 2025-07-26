// ==UserScript==
// @name         Kleinanzeigen: Anzeigen öffnen & Preis-Knöpfe & Anzeige ansehen
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Öffnet Anzeigen über 1€ zum Bearbeiten + fügt Preis-Buttons hinzu + Anzeige ansehen
// @match        https://www.kleinanzeigen.de/m-meine-anzeigen.html
// @match        https://www.kleinanzeigen.de/p-anzeige-bearbeiten.html*
// @match        https://www.kleinanzeigen.de/p-anzeige-aufgeben-bestaetigung.html*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.location.href.includes('/m-meine-anzeigen.html')) {
        function createOverviewButton() {
            const container = document.querySelector('main') || document.body;

            const button = document.createElement('button');
            button.textContent = '📂 Anzeigen über 1 € öffnen';
            button.style.position = 'fixed';
            button.style.top = '20px';
            button.style.right = '20px';
            button.style.zIndex = '1000';
            button.style.padding = '10px 15px';
            button.style.background = '#5A33AE';
            button.style.color = '#fff';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '14px';
            button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            button.style.transition = 'background 0.3s ease';

            button.addEventListener('click', () => {
                const cards = document.querySelectorAll('li[data-testid="ad-card"]');
                let opened = 0;

                for (const card of cards) {
                    const priceNode = card.querySelector('li.text-title3');
                    const editLink = card.querySelector('a[href^="/p-anzeige-bearbeiten.html"]');
                    const titleNode = card.querySelector('h3 a');

                    if (!priceNode || !editLink || !titleNode) continue;

                    const priceText = priceNode.textContent.trim();
                    const match = priceText.match(/(\d+)[,.]?(\d{0,2})?/);
                    if (!match) continue;

                    const euros = parseFloat(`${match[1]}.${match[2] || 0}`);
                    if (euros > 1) {
                        console.log(`🔧 Öffne: ${titleNode.textContent.trim()} (${euros} €)`);
                        const link = document.createElement('a');
                        link.href = editLink.href;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        opened++;
                    }
                }

                button.textContent = `✅ Fertig! ${opened} geöffnet`;
                button.style.background = '#28a745';
            });

            container.appendChild(button);
        }

        window.addEventListener('load', () => setTimeout(createOverviewButton, 1000));
    }

    if (window.location.href.includes('/p-anzeige-bearbeiten.html')) {
        function addFixedPriceButtons() {
            const priceInput = document.getElementById('micro-frontend-price');
            const submitButton = document.getElementById('pstad-submit');

            if (!priceInput || !submitButton) return;

            const wrapper = priceInput.closest('.relative');
            if (!wrapper) return;

            const currentPrice = parseInt(priceInput.value, 10);
            if (isNaN(currentPrice)) return;

            const targetPrices = new Set();

            if (currentPrice >= 55) {
                targetPrices.add(currentPrice - 5);
            } else if (currentPrice > 1) {
                targetPrices.add(currentPrice - 1);
            }

            if (targetPrices.size === 0) return;

            const container = document.createElement('div');
            container.id = 'fixed-price-buttons';
            container.style.display = 'flex';
            container.style.gap = '8px';
            container.style.marginRight = '10px';

            function setNativeInputValue(input, value) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(input, value);

                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }

            function createButton(value) {
                const btn = document.createElement('button');
                btn.textContent = `${value} €`;
                btn.style.padding = '4px 10px';
                btn.style.fontSize = '13px';
                btn.style.cursor = 'pointer';
                btn.style.border = '1px solid #888';
                btn.style.borderRadius = '6px';
                btn.style.background = '#eee';
                btn.style.transition = 'all 0.3s ease';

                btn.addEventListener('click', () => {
                    priceInput.focus();

                    setNativeInputValue(priceInput, value);

                    priceInput.blur();

                    submitButton.click();
                });

                return btn;
            }

            for (const price of [...targetPrices].sort((a, b) => b - a)) {
                const btn = createButton(price);
                container.appendChild(btn);
            }

            wrapper.appendChild(container);
        }

        window.addEventListener('load', () => setTimeout(addFixedPriceButtons, 500));
    }

    if (window.location.href.includes('/p-anzeige-aufgeben-bestaetigung.html')) {
        function ensureAdViewButton() {
            if (document.getElementById("view-ad-button")) return;

            const urlParams = new URLSearchParams(window.location.search);
            const adId = urlParams.get('adId');
            if (!adId) return;

            const section = document.getElementById('checking-done');
            if (!section) return;

            const buttonBar = section.querySelector('.bottom-button');
            if (!buttonBar) return;

            const link = document.createElement('a');
            link.id = 'view-ad-button';
            link.href = `https://www.kleinanzeigen.de/s-anzeige/${adId}`;
            link.textContent = 'Anzeige ansehen';
            link.className = 'button-tertiary';
            link.style.marginLeft = '8px';

            buttonBar.appendChild(link);
        }

        window.addEventListener('load', () => setInterval(ensureAdViewButton, 500));
        console.log("ensuring button...");
    }
})();
