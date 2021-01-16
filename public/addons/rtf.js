document.getElementById("rtf-export").style.display = "list-item";

function asciiRep(letter) {
  //TODO: ASCII repersentations of common Unicode letters
  return "?";
}

function rtfEscapeLetter(letter) {
  return "\\u" + letter.charCodeAt(0).toString(10) + asciiRep(letter);
}

function shouldRtfEscape(letter) {
  if (letter === "{" || letter === "}" || letter === "\\") return true;
  if (letter.charCodeAt(0) > 127) return true;
  return false;
}

function makeTextRtfReady(text) {
  text = Array.from(text).map(letter => shouldRtfEscape(letter) ? rtfEscapeLetter(letter) : letter).join("");
  text = text.replace(/\n/g, "\\line ");
  return text;
}

document.getElementById("rtf-export").addEventListener("click", function () {
  var rtfData = "{\\rtf1 \\ansi \\deff0{\\fonttbl {\\f0 \\fswiss Arial;}} \\f0 \\fs22" + (settings.fontSize * 2) + " ";
  rtfData += makeTextRtfReady(window.outputEle.value);
  rtfData += "}";
  var blob = new Blob([rtfData], {type: "application/rtf"});
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, "speakscribe.rtf");
  } else {
    var ele = document.createElement("a");
    ele.href = URL.createObjectURL(blob);
    ele.download = "speakscribe.rtf";        
    document.body.appendChild(ele);
    ele.click();        
    document.body.removeChild(ele);
  }
  window.exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.getElementById("dictation-text").focus();
});
