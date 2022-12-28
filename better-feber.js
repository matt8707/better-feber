// ==UserScript==
// @name         better-feber
// @version      0.2
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

// @require      file:///Users/matte/Desktop/feber.js

(function () {
    "use strict";
    const feber = document.querySelector("body");

    //////// LOAD UI ////////

    const settings = JSON.parse(window.localStorage.getItem("settings"));
    document.body.onload = UI(settings);

    //////// SCROLLFIX ////////

    // start
    setTimeout(() => { window.scrollBy(0, 1); window.scrollBy(0, -1); }, 200)

    // end
    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            window.scrollBy(0, -1); window.scrollBy(0, 1);
        }
    };

    //////// DEBUG ////////

    const debug = (key, value) => {
        if (settings?.debug_console) {
            const format = "color:black; background-color:yellow"
            console.log("%c" + key, format, value);
        }
    };

    const hide = (element, id) => {
        if (element.style.display !== "none") {
            debug(id, element);
            element.style.display = "none";
        }
    };

    debug("storage", localStorage);
    debug("cookie", document.cookie);

    //////// DARKER MODE ////////

    const darkerMode = () => {
        if (settings?.darker_mode === true) {
            feber.dataset.darkmode = "on";
            localStorage.setItem('darkmode', 'on');
            const customdarkerMode = `
                body {
                    background-attachment: fixed;
                    background-image: radial-gradient(circle, rgba(0,0,0,0.8) 30%, rgba(24,24,24,0.8) 100%);
                }
                f-bar-container {
                    background-color: #222;
                }
                f-article-footer {
                    background: #222;
                }
                :root [data-darkmode='on'] {
                    --f-article-background: #1b1b1b;
                }
            `;
            const style = document.createElement("style");
            style.id = "customdarkerMode";
            style.textContent = customdarkerMode;
            document.head.appendChild(style);
            debug("darker_mode", settings.darker_mode);
        }
    }
    darkerMode();

    //////// PREMIUM ////////

    const premium = () => {
        if (settings?.premium === true) {
            localStorage.setItem('niceGuyValue', 'true');
            feber.dataset.premium = "true";
            document.cookie = 'memberful=prenumerant;';
            document.cookie = 'memberfulID=Profil;';
            document.cookie = 'pengar446168=2;';
            debug("premium", settings.premium);
        } else {
            localStorage.removeItem('niceGuyValue');
            feber.dataset.premium = "false";
            document.cookie = "memberful=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie = "memberfulID=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie = "pengar446168=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    premium();

    if (settings?.block_cookies === true) {
        window.localStorage.setItem("CMPList", '{"lastUpdated":"2022-12-15T17:03:13Z","CMP":["2","3","5","6","7","9","10","14","18","21","23","25","27","28","30","31","35","38","44","45","46","47","50","54","58","59","61","63","65","68","69","72","76","77","79","84","90","92","96","104","105","112","113","123","125","129","134","141","162","165","167","168","170","171","181","183","185","193","198","212","217","218","221","222","224","225","227","229","231","235","236","237","242","246","247","252","258","259","264","273","277","279","280","282","284","287","291","292","294","297","299","300","302","303","304","305","306","307","308","309","310","311","312","316","318","319","321","322","323","327","329","330","332","335","338","339","340","341","343","345","348","350","351","352","353","354","355","358","359","360","361","363","364","367","369","371","372","373","374","376","378","379","380","383","384","385","386","387","388","390","392","393","396","397","399"],"expiry":1671921726033}');
        window.localStorage.setItem("_cmpRepromptHash", 'CPkVv0APkVv0AAKAtDSVCvCgAAAAAAAAACQgAAASIgFAA4ACWAZ8BHgCVwGCAO2AdyA8ECRAAAAA.YAAAAAAAAAAA.1.QjY0v9UMqYSBhGAhdjRltA==');
        document.cookie = 'euconsent-v2=CPkVv0APkVv0AAKAtDSVCvCgAAAAAAAAACQgAAASIgFAA4ACWAZ8BHgCVwGCAO2AdyA8ECRAAAAA.YAAAAAAAAAAA;';
        document.cookie = 'addtl_consent=1~';
        window.localStorage.plausible_ignore = true;
    }

    //////// TJOCK ////////

    const tjock = element => {
        if (settings?.block_tjock === true && element?.dataset?.artsite === "tjock") {
            hide(element, "block_tjock");
        }
    };
    document.onreadystatechange = function () {
        if (settings?.block_tjock === true && document.readyState == "complete") {
            const topLogo = document.querySelector("f-menu-tjocklogo");
            if (topLogo) topLogo.remove();
        }
    }

    //////// SPONSORED ////////

    const sponsored = element => {
        if (settings?.block_sponsored === true && element?.id === "insertCmsPengarTwo") {
            hide(element, "block_sponsored");
        }
    };

    //////// RELATED ////////

    const related = element => {
        const inline = element.querySelector("f-internallinks-new");
        if (settings?.block_related === true && inline?.dataset?.rp === "yes") {
            hide(inline, "block_related");
        }
    };

    //////// INFINITE SCROLL ////////

    const infiniteScroll = () => {
        if (settings?.infinite_scroll === true && window.stopLoading !== false) {
            window.stopLoading = false;
            window.viewedArts = 1;
            window.globalArtCounterJS = 1;
            const hideScrollbar = `
                body {
                    scrollbar-width: none;
                }
                body::-webkit-scrollbar { 
                    display: none;
                }
            `;
            const style = document.createElement("style");
            style.id = "hideScrollbar";
            style.textContent = hideScrollbar;
            document.head.appendChild(style);
            debug("infinite_scroll", !window.stopLoading);
        }
    };

    //////// FILTER ////////

    const filter = [];
    if (settings) {
        for (const [key] of Object.entries(settings)) {
            if (key.startsWith("filter_")) {
                filter.push(key.split("filter_")[1]);
            }
        }
    }

    const filterCat = element => {
        if (element?.dataset.caturl && filter.indexOf(element?.dataset?.caturl) !== -1) {
            hide(element, `filter_${element.dataset.caturl}`);
        }
    };

    //////// LOAD MORE ////////

    let load_more = element => {
        if (settings?.load_more === true) {
            window.lazySizes.cfg.iframeLoadMode = "1";
            const load_more = feber.querySelector("f-content").nextElementSibling;
            if (load_more.tagName === "SCRIPT" && load_more?.text.includes("tweak = 1000")) {
                const load_tweak_update = document.createElement('script');
                load_tweak_update.text = load_more.text
                    .replace("tweak = 1000", "tweak = 4000")
                    .replace("history.pushState", "// history.pushState");
                load_more.parentNode.insertBefore(load_tweak_update, load_more)
                load_more.remove();
            }
            // next
            for (const nextLink of feber.querySelectorAll("[id^='nextLinkbar']")) {
                if (nextLink) nextLink.remove();
            }
            // fix url page param
            for (const content of feber.querySelectorAll("f-content")) {
                const rect = content.getBoundingClientRect();
                if (rect.y < 0 && rect.bottom > 0) {
                    const currentPage = content.dataset.page;
                    const urlPage = new URLSearchParams(window.location.search).get("p");
                    if (currentPage !== urlPage) {
                        history.pushState("", "", `?p=${currentPage}`);
                        if (currentPage > 1) {
                            feber.querySelector(`[data-page="${currentPage - 1}"]`).remove();
                        }
                    }
                }
            }
        }
    };

    //////// LAZY ////////

    const lazy_remove = () => {
        if (settings?.lazy_remove === true) {
            window.lazySizes.cfg.expand = 1500;
            window.lazySizes.cfg.iframeLoadMode = "1";
        }
    };
    lazy_remove();

    const remove_disqus = () => {
        if (settings?.remove_disqus === true) {
            const remove_disqus = `
                f-bubble {
                    display: none;
                }
            `;
            const style = document.createElement("style");
            style.id = "remove_disqus";
            style.textContent = remove_disqus;
            document.head.appendChild(style);
        }
    };
    remove_disqus();

    //////// UI SETTINGS ////////

    function UI(saveState) {

        // main
        const settings = document.createElement("div");
        settings.id = "settings";
        document.body.prepend(settings);

        // style
        const style = document.createElement("style");
        style.innerHTML = `
            .container {
                display: none;
                position: fixed;
                z-index: 1000;
                background-color: rgba(0,0,0,0.7);
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                backdrop-filter: blur(10px);
            }

            .modal {
                background-color: rgba(34, 34, 34, 0.95);
                color: var(--f-menu-nohover);
                margin: 10% auto;
                padding: 30px;
                border-radius: 15px;
                width: 60%;
                user-select: none;
                border: 1px solid rgb(58 58 58);
            }

            .open {
                background-color: transparent;
                border: none;
                cursor: pointer;
                float: right;
                padding: 5px 12px;
                margin: 9px;
            }
            
            .close {
                color: var(--f-menu-nohover);
                float: right;
                font-size: 2.5em;
                font-weight: bold;
                cursor: pointer;
                transition: color .3s;
            }

            .close:hover {
                color: var(--f-menu-hover);
            }

            #cog {
                width: 22px;
                fill: var(--f-menu-nohover);
                transition: fill .3s;
            }

            #cog:hover, .close:hover {
                fill: var(--f-menu-hover);
            }

            h1 {
                font-size: 2em;
                font-family: system-ui;
                font-weight: 600;
                margin-bottom: 1.2em;
                margin-top: 0.15em;
                letter-spacing: 0.8px;
            }

           h2 {
                font-size: 1.7em;
                font-family: system-ui;
                font-weight: 300;
                margin-bottom: 1.5em;
                margin-top: 0.12em;
                letter-spacing: 1.3px;
            }

            label {
                font-family: system-ui;
                font-size: 1.1em;
                font-weight: 300;
            }

            label input {
                margin: 0 0 8px 0;
             }

            input[type="submit"] {
                margin-top: 0.4em;
                background-color: rgb(49 49 49);
                border: none;
                color: white;
                padding: 17px 24px 17.5px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 300;
                font-family: system-ui;
                letter-spacing: 0.9px;
                font-size: 1.15em;
                border: 1px solid rgb(58 58 58);
                margin: 10px;
            }

            .title {
                display: block;
                margin: -23px 0 0 25px;
            }

            .info {
                opacity: 0.4;
                position: absolute;
                margin-top: -27px;
                margin-left: 25px;
                font-size: 13px;
                font-weight: 300;
                font-family: system-ui;
            }

            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr 0.7fr;
                grid-template-rows: 1.8fr 0.2fr;
                gap: 0 40px;
                grid-auto-flow: row;
                grid-template-areas:
                    "general visibility filter"
                    "actions actions actions";
              }

            .general { grid-area: general; }
            .visibility { grid-area: visibility; }
            .filter { grid-area: filter; }
            .actions {
                grid-area: actions;
                display: flex;
                justify-content: space-evenly;
            }
        `;
        settings.append(style);

        // container
        const container = document.createElement("div");
        container.classList.add("container");
        settings.append(container);

        // modal
        const modal = document.createElement("div");
        modal.classList.add("modal");
        container.append(modal);

        // render item
        const item = (id, title, desc = "") => {
            return `
                <label for="${id}">
                    <input name="${id}" type="checkbox" 
                    ${saveState?.[id] || false ? "checked" : ""}>
                <span class="title">${title}</span>
                </label>
                ${desc === "" ? "" : "<br><br>"}
                <span class="info">${desc}</span>
                <br>
            `;
        };

        // render action
        const action = (id, title) => {
            var bgc;
            if (id === "save") bgc = "rgb(43, 52, 42)";
            if (id === "template") bgc = "rgb(49, 49, 49)";
            if (id === "delete") bgc = "rgb(61, 41, 41)";
            return `
                <input id="${id}" type="submit" value="${title}"
                    style="background-color: ${bgc};"></input>
            `;
        };

        // form
        const form = document.createElement("form");
        form.classList.add("grid");
        form.innerHTML = `
                <div class="general">
                    <h2>Allmänt</h2>
                    ${item("premium", "🥇 &shy; Premium", "Aktivera premium")}
                    ${item("block_cookies", "🍪 &shy; Integritet", "Avböj alla spårare och riktad reklam")}
                    ${item("darker_mode", "🌚 &shy; Mörkare", "Slå på ännu mörkare dark mode")}
                    ${item("lazy_remove", "⚡ &shy; Latmask", 'Snabbare "lat laddning" av bilder')}
                    ${item("load_more", "📃 &shy; Framåtblicka", "Ladda in flera sidor samtidigt")}
                    ${item("infinite_scroll", "♾️ &shy; Oändlig rullning", "Nya sidor laddas in och gamla avlastas")}
                </div>

                <div class="visibility">
                    <h2>Synlighet</h2>
                    ${item("block_sponsored", "💰 &shy; Sponsrat", "Dölj sponsrade artiklar")}
                    ${item("block_related", "🪧 &shy; Relaterat", 'Dölj inbäddade annonser')}
                    ${item("block_tjock", "🍔 &shy; Tjock", "Dölj artiklar från tjock.se")}
                    ${item("remove_disqus", "🤡 &shy; Disqus", "Dölj användarkommentarer")}
                    ${"<br>".repeat(4)}
                    ${item("debug_console", "🧑‍💻 &shy; Utvecklare", "Skicka händelser till konsolen")}
                </div>

                <div class="filter">
                    <h2>Filter</h2>
                    ${item("filter_bil", "Bil")}
                    ${item("filter_fordon", "Fordon")}
                    ${item("filter_film", "Film/TV")}
                    ${item("filter_internet", "Internet")}
                    ${item("filter_mac", "Mac")}
                    ${item("filter_mobil", "Mobil")}
                    ${item("filter_pc", "PC")}
                    ${item("filter_pryl", "Pryl")}
                    ${item("filter_samhalle", "Samhälle")}
                    ${item("filter_spel", "Spel")}
                    ${item("filter_vetenskap", "Vetenskap")}
                    ${item("filter_video", "Video")}
                </div>
        
                <div class="actions">
                    <div>
                        ${action("save", "Spara")}
                        ${action("template", "Standardmall")}
                        ${action("delete", "Radera")}
                    </div>
                </div>
        `;
        modal.append(form);

        // submit
        const handleSubmit = event => {
            event.preventDefault();
            const action = event.submitter.id;

            if (action === "save") {
                const formData = new FormData(event.target);
                var state = {};
                formData.forEach((key, value) => state[value] = true);
                window.localStorage.setItem("settings", JSON.stringify(state));
                window.location.reload();
            }

            if (action === "delete") {
                window.localStorage.removeItem("settings");
                window.location.reload()
            }

            if (action === "template") {
                const allBoxes = form.querySelectorAll("input[type=checkbox]");
                for (const box of allBoxes) {
                    box.checked = false;
                    if (["debug_console"].indexOf(box.name) === -1
                        && !box.name.startsWith("filter_")) {
                        box.checked = true;
                    }
                    if (box.name === "filter_bil") box.checked = true;
                    if (box.name === "filter_fordon") box.checked = true;
                }
            }
        };
        form.addEventListener("submit", handleSubmit);

        // open
        const open = document.createElement("button");
        open.innerHTML = `
            <svg id="cog" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 1 1 0 7m7.43-2.53a7.77 7.77 0 0 0
                .07-.97 8.55 8.55 0 0 0-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46a.49.49 0 0
                0-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37
                2.65c-.63.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11l-.07 1a7.77
                7.77 0 0 0 .07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74
                1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65a7.28 7.28 0 0 0 1.69-.99l2.49 1.01c.22.08.49
                0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
            </svg>
        `;
        open.classList.add("open");
        open.onclick = () => {
            getComputedStyle(container).display === "none"
                ? container.style.display = "block"
                : container.style.display = "none";
        };
        document.querySelector("f-menu").append(open);

        // close
        const close = document.createElement("span");
        close.classList.add("close");
        close.innerHTML = "&times;";
        close.onclick = () => {
            container.style.display = "none";
        };
        modal.prepend(close);
        window.onclick = (event) => {
            if (event.target == container) {
                container.style.display = "none";
            }
        }
    }

    //////// SCROLL EVENT ////////

    ["DOMContentLoaded", "load", "scroll"].forEach((event) => {
        window.addEventListener(event, throttle(callback, 500), { passive: true });
    });

    function throttle(fn, wait) {
        var time = Date.now();
        return function () {
            if ((time + wait - Date.now()) < 0) {
                fn();
                time = Date.now();
            }
        }
    }

    function callback() {
        for (const content of feber.querySelectorAll("f-content")) {
            for (const element of content.children) {
                filterCat(element);
                infiniteScroll();
                tjock(element);
                sponsored(element);
                related(element);
                load_more();
            }
        }
    }

    // END
})();
