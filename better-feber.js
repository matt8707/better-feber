// ==UserScript==
// @name         better-feber
// @version      0.1
// @description  enhancements for feber.se
// @license      MIT
// @author       matt8707
// @namespace    http://tampermonkey.net/
// @match        https://feber.se/*
// @icon         https://feber.se/faviconsfeber/apple-touch-icon.png
// @updateURL    https://raw.githubusercontent.com/matt8707/better-feber/master/better-feber.js
// @downloadURL  https://raw.githubusercontent.com/matt8707/better-feber/master/better-feber.js
// @supportURL   https://github.com/matt8707/better-feber/issues
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    let feber = document.querySelector("body");

    feber.dataset.premium = "true";
    feber.dataset.darkmode = "on";

    if (feber.dataset.darkmode === "on") {
        const customStyles = `
            body {
                background-attachment: fixed;
                background-image: radial-gradient(circle, rgba(0,0,0,0.8) 30%, rgba(24,24,24,0.8) 100%);
            }

            f-bar-container {
                background-color: #222;
            }

            f-article-body {
                font-family: system-ui;
            }

            f-article-footer {
                background: #222;
            }

            :root [data-darkmode='on'] {
                --f-article-background: #1b1b1b;
            }

            f-bubble {
                display: none; /* disqus */
            }
        `;
        const style = document.createElement("style");
        style.textContent = customStyles;
        document.head.appendChild(style);
    }

    if (feber.dataset.premium !== "true") {

        // center content
        for (const style of document.querySelectorAll("head > style")) {

            const articles = /:root \[data-premium='false'] {([^}]*)}/g;
            if (style.innerHTML.match(articles)) {
                const subst = `
                    :root [data-premium='false'] {
                        --f-margin-right: auto !important;
                        --f-margins: 0px auto 0px auto !important;
                        --f-margins-margins: 20px auto 20px auto !important;
                    }
                `;
                const replace = style.innerHTML.replace(articles, subst);
                style.innerHTML = replace;
            }

            const media = /max-width: calc\(100vw - 320px\); margin: 0;/g;
            if (style.innerHTML.match(media)) {
                const subst = `max-width: calc(100vw - 320px); margin: auto;`;
                const replace = style.innerHTML.replace(media, subst);
                style.innerHTML = replace;
            }

        }

        // anti anti-adblock
        ["DOMContentLoaded", "load", "scroll"].forEach((event) => {
            window.addEventListener(event, antiadblock);
        });
        function antiadblock() {
            let content = feber.querySelector("f-content:last-of-type");
            for (const element of content.children) {
                if (!Number.isNaN(Number.parseInt(element.tagName.split("F-")[1]))) {
                    element.setAttribute("style", "display: none !important");
                }
            }
        };

        // remove premium text
        const premiumText = feber.querySelector("f-menu-premium-notloggedin > f-menu-premium-text");
        if (premiumText) premiumText.style.display = "none";

    }

    // END

})();
