document.getElementById("font-size-settings-item").style.display = "block";

window.outputEle.style.fontSize = ((window.settings.fontSize === -1) ? 12 : window.settings.fontSize) + "pt";
document.getElementById("pending-text-overlay").style.fontSize = ((window.settings.fontSize === -1) ? 12 : window.settings.fontSize) + "pt";
window.onSettingsChange(function () {
  let needsUpdate = false;
  if (window.settings.fontSize > 200) {
    window.settings.fontSize = 200;
    needsUpdate = true;
  }
  if (window.settings.fontSize !== Math.round(window.settings.fontSize)) {
    window.settings.fontSize = Math.round(window.settings.fontSize);
    needsUpdate = true;
  }
  if (needsUpdate) return window.applySettings();
  window.outputEle.style.fontSize = ((window.settings.fontSize === -1) ? 12 : window.settings.fontSize) + "pt";
  document.getElementById("pending-text-overlay").style.fontSize = ((window.settings.fontSize === -1) ? 12 : window.settings.fontSize) + "pt";
});
