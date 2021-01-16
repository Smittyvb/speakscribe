document.getElementById("themes-setting-item").style.display = "block";

(function () {
  window.styleEle = document.createElement("style");
  document.head.appendChild(styleEle);
  window.addCSSRule = function addCSSRule(rule) {
    //TODO: handle when we load before CSS
    styleEle.sheet.insertRule(rule, styleEle.sheet.length);
  }
})();


addCSSRule(`
body.dark #pending-text-overlay, body.dark #pending-text-top {
  color: #8294ff;
}
`);

addCSSRule(`
body.dark, body.dark textarea, body.dark #pending-text-overlay {
  background: black;
  color: white;
  border-color: black !important;
}
`);

addCSSRule(`
body.dark header {
  border-bottom-color: white !important;
}
`);

addCSSRule(`
body.dark textarea::placeholder {
  color: #a3a3a3;
}
`);

addCSSRule(`
body.dark #settings, body.dark #files {
  color: black;
  background: #e89600 !important;
  border-left: 1px solid black;
}
`);

addCSSRule(`
body.dark #microphone {
  background: #ffbd45 !important;
}
`);

addCSSRule(`
body.dark .base-color {
  color: white;
}
`);

addCSSRule(`
body.dark #export-diag {
  background: #757575;
  color: #f5f5f5;
}
`);

addCSSRule(`
body.dark #export-diag li {
  color: #42dcff;
}
`);

addCSSRule(`
body.dark #export-x {
  color: white;
}
`);

addCSSRule(`
body.dark #custom-commands-diag {
  background: #494a50;
}
`);

function applyTheme() {
  if (settings.theme === "dark") {
    document.body.classList.add("dark");
    localStorage["bd-init-bd-color"] = "#000";
  } else {
    document.body.classList.remove("dark");
    localStorage.removeItem("bd-init-bd-color");
  }
}

applyTheme();

onSettingsChange(applyTheme);
