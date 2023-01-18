// ==UserScript==
// @name         better-feber
// @version      0.3.2
// @description  enhancements for feber.se
// @license      MIT
// @author       matt8707
// @namespace    https://github.com/matt8707/better-feber/
// @match        https://feber.se/*
// @icon         https://feber.se/faviconsfeber/apple-touch-icon.png
// @updateURL    https://raw.githubusercontent.com/matt8707/better-feber/master/better-feber.js
// @downloadURL  https://raw.githubusercontent.com/matt8707/better-feber/master/better-feber.js
// @supportURL   https://github.com/matt8707/better-feber/issues
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // load settings
  const settings = JSON.parse(localStorage.getItem("settings"));

  // filtered categories
  const filter = [];
  if (settings) {
    for (const [key] of Object.entries(settings)) {
      if (key.startsWith("filter_")) {
        filter.push(key.split("filter_")[1]);
      }
    }
  }

  // debug
  const debug = (key, value, color = "#2f6524", info = "") => {
    if (settings?.console) {
      const style = `
          color: white;
          background-color: ${color};
          padding: 2px 4px;
        `;
      console.debug("%c" + info + key, style, value);
    }
  };

  // hide element
  const hide = (key, node) => {
    if (node.style.display !== "none") {
      if (settings?.console) {
        debug(key, node, "#98882e", "hide_");
      }
      node.style.display = "none";
    }
  };

  // remove element
  const remove = (key, node) => {
    if (settings?.console) {
      debug(key, node, "#6b2929", "remove_");
    }
    node.remove();
  };

  // settings modal
  const loadUI = (saveState) => {
    //
    // main
    const settings = document.createElement("div");
    settings.id = "settings";
    document.body.prepend(settings);

    // style
    settings.append(
      Object.assign(document.createElement("style"), {
        innerHTML: `
        /* open */

          #cog {
            width: 20px;
            fill: var(--f-menu-nohover);
            transition: fill .3s;
          }

          #cog:hover {
            fill: var(--f-menu-hover);
          }

          .open {
            background-color: transparent;
            border: none;
            cursor: pointer;
            float: right;
            padding: 15px;
          }

          @media only screen and (max-width: 600px) {
            #cog {
              width: 15px;
            }
          }

        /* close */

          .close {
            color: var(--f-menu-nohover);
            float: right;
            font-size: 2.5em;
            font-weight: bold;
            cursor: pointer;
            transition: color .3s;
            position: absolute;
            z-index: 2000;
            right: 30px;
          }
    
          .close:hover {
            color: var(--f-menu-hover);
          }

        /* modal */

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
            -webkit-backdrop-filter: blur(10px);
          }

          .modal {
            background-color: rgba(34, 34, 34, 0.95);
            color: var(--f-menu-nohover);
            margin: 5em auto;
            padding: 30px;
            border-radius: 15px;
            width: fit-content;
            user-select: none;
            border: 1px solid rgb(58 58 58);
            position: relative;
          }

        /* form */

          label {
            font-family: system-ui;
            font-size: 1.1em;
            font-weight: 300;
          }

          label input {
            margin: 0 0 8px 0;
          }

          input[type="submit"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
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
          }

        /* grid */

          .grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: start;
          }

          .item {
            padding-bottom: 20px;
          }

          .general {
            width: 300px;
          }

          .visibility {
            width: 300px;
          }

          .filter {
            width: 180px;
          }

        /* content */

          h2 {
            font-size: 1.7em;
            font-family: system-ui;
            font-weight: 300;
            margin-bottom: 1.5em;
            margin-top: 0.12em;
            letter-spacing: 1.3px;
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

          .actions {
            display: flex;
            justify-content: space-evenly;
            margin: auto;
            max-width: 400px;
          }

        /* offload */

          .warning {
            background: #322b08;
            padding: 10px 15px;
            border-radius: 5px;
            border: 1px solid #635617;
            color: #e7ae47;
            font-size: 13px;
            max-width: fit-content;
            margin: 0 auto 17px auto;
          }

          .offload-sticky {
            position: sticky;
            top: 50%;
            user-select: none;
          }

          .offload-button {
            margin: 20px auto;
            display: flex;
            background-color: var(--f-hot-color);
            font-weight: bold;
            color: white;
            padding: 10px 15px;
            border: 0;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
          }
        `,
      })
    );

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
          <input name="${id}" id="${id}" type="checkbox" ${saveState?.[id] || false ? "checked" : ""}>
          <span class="title">${title}</span>
          ${desc === "" ? "" : "<br><br>"}
          <span class="info">${desc}</span>
        </label>
        <br>
      `;
    };

    // form
    const form = document.createElement("form");
    modal.append(form);

    // grid
    const grid = document.createElement("div");
    grid.classList.add("grid");
    form.append(grid);

    // general
    grid.append(
      Object.assign(document.createElement("div"), {
        classList: "general item",
        innerHTML: `
          <h2>Allmänt</h2>
          ${item("premium", "🥇 &shy; Premium", "Aktivera premium")}
          ${item("privacy", "🍪 &shy; Integritet", "Avböj alla spårare och riktad reklam")}
          ${item("darker_mode", "🌚 &shy; Mörkare", "Slå på ännu mörkare dark mode")}
          ${item("lazy_load", "⚡ &shy; Latmask", 'Snabbare "lat laddning" av bilder')}
          ${item("tweak", "📃 &shy; Framåtblicka", "Ladda in flera sidor samtidigt")}
          ${item("infinite_scroll", "♾️ &shy; Oändlig rullning", "Nya sidor laddas in och gamla avlastas")}
        `,
      })
    );

    // visibility
    grid.append(
      Object.assign(document.createElement("div"), {
        classList: "visibility item",
        innerHTML: `
          <h2>Synlighet</h2>
          ${item("sponsored", "💰 &shy; Sponsrat", "Dölj sponsrade artiklar")}
          ${item("related", "🪧 &shy; Relaterat", "Dölj inbäddade annonser")}
          ${item("tjock", "🍔 &shy; Tjock", "Dölj artiklar från tjock.se")}
          ${item("disqus", "🤡 &shy; Disqus", "Dölj användarkommentarer")}
          ${"<br>".repeat(4)}
          ${item("console", "🧑‍💻 &shy; Utvecklare", "Skicka händelser till konsolen")}
        `,
      })
    );

    // filter
    grid.append(
      Object.assign(document.createElement("div"), {
        classList: "filter item",
        innerHTML: `
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
        `,
      })
    );

    // chrome warning
    if (navigator.userAgent.includes("Chrome")) {
      form.append(
        Object.assign(document.createElement("div"), {
          style: `${saveState?.sound ? "display: none;" : "display: block;"}`,
          classList: "warning",
          innerHTML: `
            <p style="line-height: 1.8em;">
              ⚠️ &shy; För att inbäddade videor ska spelas upp direkt i Chrome krävs det att du tillåter ljud.
            </p>
            <p style="line-height: 1.8em;">
              Klicka på <b>"Låset i adressfältet" → "Webbplatsinställningar" → "Ljud: Tillåt"</b>
            </p>
            <p style="margin-left: -4px; margin-top: 2.5px; padding-bottom: 4px;">
              <input name="sound" type="checkbox" ${saveState?.sound || false ? "checked" : ""}>
              <span style="margin-left: 5px; margin-top: 1.5px; position: absolute;">Visa inte igen</span>
            </p>
        `,
        })
      );
    }

    // actions
    const action = (id, title, color) => {
      return `
          <input id="${id}" type="submit" value="${title}" style="background-color: ${color};"></input>
        `;
    };
    form.append(
      Object.assign(document.createElement("div"), {
        classList: "actions",
        innerHTML: `
          ${action("save", "Spara", "rgb(43, 52, 42)")}
          ${action("template", "Mall", "rgb(49, 49, 49)")}
          ${action("delete", "Radera", "rgb(61, 41, 41)")}
        `,
      })
    );

    // submit
    const handleSubmit = (event) => {
      event.preventDefault();
      const action = event.submitter.id;

      if (action === "save") {
        const formData = new FormData(event.target);
        var state = {};
        formData.forEach((key, value) => (state[value] = true));
        window.localStorage.setItem("settings", JSON.stringify(state));
        document.querySelector("html").remove();
        location.reload(true);
      }

      if (action === "delete") {
        window.localStorage.removeItem("settings");
        document.querySelector("html").remove();
        location.reload(true);
      }

      if (action === "template") {
        const allBoxes = form.querySelectorAll("input[type=checkbox]");
        for (const box of allBoxes) {
          box.checked = false;
          const ignore = ["console"];
          if (ignore.indexOf(box.name) === -1 && !box.name.startsWith("filter_")) {
            box.checked = true;
          }
          if (box.name === "sound") box.checked = saveState?.sound;
          if (box.name === "filter_bil") box.checked = true;
          if (box.name === "filter_fordon") box.checked = true;
        }
      }
    };
    form.addEventListener("submit", handleSubmit);

    // open
    const fMenu = document.querySelector("f-menu");
    const menuTarget = document.querySelector("f-menu > f-menu-premium");
    fMenu.insertBefore(
      Object.assign(document.createElement("button"), {
        classList: "open",
        innerHTML: `
          <svg id="cog" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 1 1 0 7m7.43-2.53a7.77 7.77 0 0 0
            .07-.97 8.55 8.55 0 0 0-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46a.49.49 0 0
            0-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37
            2.65c-.63.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11l-.07 1a7.77
            7.77 0 0 0 .07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74
            1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65a7.28 7.28 0 0 0 1.69-.99l2.49 1.01c.22.08.49
            0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
          </svg>
        `,
        onclick: () => {
          getComputedStyle(container).display === "none"
            ? (container.style.display = "block") //
            : (container.style.display = "none");
        },
      }),
      menuTarget
    );

    // close
    modal.prepend(
      Object.assign(document.createElement("span"), {
        classList: "close",
        innerHTML: "&times;",
        onclick: () => {
          container.style.display = "none";
        },
      })
    );
    window.onclick = (event) => {
      if (event.target == container) {
        container.style.display = "none";
      }
    };
  };
  // END MODAL

  const fHead = (mutation) => {
    for (const node of mutation.addedNodes) {
      if (settings?.privacy && node.nodeName === "SCRIPT") {
        //
        // maxapi_script
        if (node?.dataset.name === "maxapi") {
          remove("script", node);
        }

        // ext_scripts
        const ext = [
          "https://maxetise.net/prebid.feber.se.js",
          "https://securepubads.g.doubleclick.net/tag/js/gpt.js",
          "https://plausible.io/js/plausible.outbound-links.manual.js",
          "https://cmp.quantcast.com/choice/dyQKfrY5GJuXu/feber.se/choice.js",
          "https://macro.adnami.io/macro/spec/adsm.macro.b66932c6-4466-414e-8cd3-a3789e825dfe.js",
          "https://securepubads.g.doubleclick.net/gpt/pubads_impl_2023010406.js",
          "https://secure.quantserve.com/quant.js",
          "https://quantcast.mgr.consensu.org/tcfv2/cmp2.js?referer=feber.se",
          "https://macro.adnami.io/macro/gen/adsm.macro.rmb.js",
          "https://rules.quantcount.com/rules-p-dyQKfrY5GJuXu.js",
          "https://securepubads.g.doubleclick.net/gpt/pubads_impl_2023010901.js",
        ];

        for (const script of ext) {
          if (node.src === script) {
            remove("script", node);
          }
        }
      }
    }
  };

  const fBody = (mutation) => {
    for (const node of mutation.addedNodes) {
      if (node.nodeName === "SCRIPT") {
        //
        // disqus_script
        if (settings?.disqus && node.id === "dsq-count-scr") {
          remove("disqus", node);
        }

        // tweak
        if (settings?.tweak && node.previousElementSibling && node.previousElementSibling.nodeName === "F-CONTENT") {
          debug("load_more", true);
          const loadFeber = node.textContent.replace("tweak = 1000", "tweak = 4000").replace("history.pushState", "// history.pushState");
          node.textContent = loadFeber;
        }
      }
    }
  };

  const fMenu = (mutation) => {
    for (const node of mutation.addedNodes) {
      //
      // tjock
      if (settings?.tjock && node.nodeName === "F-MENU-TJOCKLOGO") {
        remove("tjock", node);
      }
    }
  };

  const fContent = (mutation) => {
    //
    // lazy_load
    if (settings?.lazy_load && window.lazySizes?.cfg.expand !== 1500) {
      window.lazySizes.cfg.expand = 1500;
      window.lazySizes.cfg.iframeLoadMode = "1";
      debug("lazy_load", settings.lazy_load);
    }

    // infinite_scroll
    if (settings?.infinite_scroll && window.stopLoading !== false) {
      window.stopLoading = false;
      debug("infinite_scroll", settings.infinite_scroll);
    }

    for (const node of mutation.addedNodes) {
      //
      // sponsored
      if (settings?.sponsored && node.id === "insertCmsPengarTwo") {
        remove("sponsored", node);
      }

      // ads
      if (settings?.premium && node.nodeName === "F-PANORAMA") {
        remove("ad", node);
      }

      if (node.nodeName === "F-ARTICLE") {
        //
        // filter_cat
        const cat = node.dataset.caturl;
        if (cat && filter?.indexOf(cat) !== -1) {
          hide(cat, node);
        }

        // tjock_article
        else if (settings?.tjock && node.dataset.artsite === "tjock") {
          hide("tjock", node);
        }

        // related_ads
        if (settings?.related) {
          const related = node.querySelector("f-internallinks-new");
          if (related && related.dataset && related.dataset.rp === "yes") {
            remove("related", related);
          }
        }

        // disqus_bubble
        const disqusBubble = node.querySelector("f-article-footer > f-bubble");
        if (settings?.disqus && disqusBubble) remove("disqus", disqusBubble);
      }
    }
  };

  const fScroll = () => {
    //
    // current_page
    for (const content of document.querySelectorAll("f-content")) {
      const page = content.getBoundingClientRect();
      if (page.y < 0 && page.bottom > 0) {
        var currentPage = content.dataset.page;
      }
    }

    // url_param
    if (settings?.tweak) {
      const urlPage = new URLSearchParams(window.location.search).get("p");
      if (currentPage && currentPage !== urlPage) {
        history.pushState("", "", `?p=${currentPage}`);
      }
    }

    // offload
    if (settings?.infinite_scroll) {
      const selector = document.querySelector(`[data-page="${currentPage - 3}"]`);
      if (selector) {
        selector.style.minHeight = `${selector.getBoundingClientRect().height}px`;
        if (selector.dataset.loaded !== "false") {
          const page = selector.dataset.page;
          selector.dataset.loaded = "false";
          selector.innerHTML = `
            <div class="offload-sticky">
              <div class="warning">
                ⚠️ &shy; Sida ${page} har avlastats p.g.a <b>"Oändlig rullning"</b>
              </div>
              <button class="offload-button" onclick="location.href='https://feber.se/?p=${page}';">
                Ladda om sida ${page}
              </button>
            </div>
          `;
        }
      }
    }

    // scroll_end
    let pageBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 1;
    if (pageBottom) {
      window.scrollBy(0, -1);
      debug("scroll_end", true);
    }
  };

  const fLoad = () => {
    //
    // scroll_start
    const scrollStart = document.documentElement.scrollTop === 0;
    if (scrollStart) {
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
      debug("scroll_start", scrollStart);
    }
    //
    // log_info
    debug("storage", localStorage);
    debug("cookie", document.cookie);

    if (settings?.tjock) {
      const tjockLogo = document.querySelector("f-menu > f-menu-tjocklogo");
      if (tjockLogo) {
        remove("tjock", tjockLogo);
      }
    }

    // load_ui
    loadUI(settings);

    // premium
    if (settings?.premium) {
      localStorage.setItem("niceGuyValue", "true");
      document.querySelector("body").dataset.premium = "true";
      document.cookie = "memberful=prenumerant;";
      document.cookie = "memberfulID=Profil;";
      document.cookie = "pengar446168=2;";
    } else {
      localStorage.removeItem("niceGuyValue");
      document.querySelector("body").dataset.premium = "false";
      document.cookie = "memberful=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "memberfulID=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "pengar446168=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    debug("premium", settings?.premium || false);

    // privacy
    if (settings?.privacy) {
      window.localStorage.setItem(
        "CMPList",
        '{"lastUpdated":"2022-12-15T17:03:13Z","CMP":["2","3","5","6","7","9","10","14","18","21","23","25","27","28","30","31","35","38","44","45","46","47","50","54","58","59","61","63","65","68","69","72","76","77","79","84","90","92","96","104","105","112","113","123","125","129","134","141","162","165","167","168","170","171","181","183","185","193","198","212","217","218","221","222","224","225","227","229","231","235","236","237","242","246","247","252","258","259","264","273","277","279","280","282","284","287","291","292","294","297","299","300","302","303","304","305","306","307","308","309","310","311","312","316","318","319","321","322","323","327","329","330","332","335","338","339","340","341","343","345","348","350","351","352","353","354","355","358","359","360","361","363","364","367","369","371","372","373","374","376","378","379","380","383","384","385","386","387","388","390","392","393","396","397","399"],"expiry":1671921726033}'
      );
      window.localStorage.setItem(
        "_cmpRepromptHash",
        "CPkVv0APkVv0AAKAtDSVCvCgAAAAAAAAACQgAAASIgFAA4ACWAZ8BHgCVwGCAO2AdyA8ECRAAAAA.YAAAAAAAAAAA.1.QjY0v9UMqYSBhGAhdjRltA=="
      );
      document.cookie = "euconsent-v2=CPkVv0APkVv0AAKAtDSVCvCgAAAAAAAAACQgAAASIgFAA4ACWAZ8BHgCVwGCAO2AdyA8ECRAAAAA.YAAAAAAAAAAA;";
      document.cookie = "addtl_consent=1~";

      // analytics
      window.localStorage.plausible_ignore = true;
    }
    debug("privacy", settings?.privacy || false);

    // darker⁡_mode
    if (settings?.darker_mode) {
      if (localStorage.getItem("darkmode") !== "on") {
        window.darkmodeSet();
      }
      const darkerMode = `
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
      style.id = "darkerMode";
      style.textContent = darkerMode;
      document.head.appendChild(style);
    }
  };
  debug("darker_mode", settings?.darker_mode || false);

  // mutation_observer
  const fObserver = (mutations) => {
    for (const mutation of mutations) {
      switch (mutation.target.nodeName) {
        case "HEAD":
          fHead(mutation);
          break;
        case "BODY":
          fBody(mutation);
          break;
        case "F-MENU":
          fMenu(mutation);
          break;
        case "F-CONTENT":
          fContent(mutation);
          break;
      }
    }
  };
  const observer = new MutationObserver(fObserver);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  if (!settings) observer.disconnect();

  // events
  window.addEventListener("scroll", fScroll, { passive: true });
  window.addEventListener("load", fLoad);

  // privacy
  if (settings?.privacy) {
    window.runReadPeak = (a, b) => {};
    window.__tcfapi = (a, b) => {};
  }

  // disqus
  if (settings?.disqus) {
    window.DISQUSWIDGETS = {};
    DISQUSWIDGETS.getCount = () => {};
  }

  // loadfeber
  if (settings?.tweak) {
    window.loadFeber = function loadFeber(page, baseurl, extraurl) {
      var tweak = 4000;
      var fired = 0;
      var bouncer = "<w8><w8a></w8a><w8b></w8b></w8>";
      setTimeout(() => {
        $("f-content[data-page=" + page + "]")
          .html(bouncer)
          .load(baseurl + page + extraurl + "&globalArtCounterJS=1&first=true");
      }, 1);
      var scrollListener = function () {
        $(window).one("scroll", function () {
          if (window.stopLoading == "true") {
          } else {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - tweak) {
              if (fired == 0) {
                fired = 1;
                ++page;
                $('<f-content data-page="' + page + '" data-loaded="false"></f-content>').insertAfter("f-content[data-page=" + (page - 1) + "]");
                $("f-content[data-page=" + page + "]")
                  .html(bouncer)
                  .attr("data-loaded", "loading")
                  .load(baseurl + page + extraurl + "&globalArtCounterJS=" + window.globalArtCounterJS, function (response, status, xhr) {
                    if (status == "error") {
                      inScrError(page, xhr);
                    }
                    if (status == "success") {
                      fired = 0;
                      $("f-content[data-page=" + page + "]").attr("data-loaded", "true");
                      inScrSuccess(xhr);
                    }
                  });
              }
            }
          }
          setTimeout(scrollListener, 200);
        });
      };
      $(document).ready(function () {
        setTimeout(function () {
          scrollListener();
        }, 500);
      });
    };
  }
  //
  // END
})();
