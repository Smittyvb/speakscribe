// General-purpose utils

if (!String.prototype.splice) {
  String.prototype.splice = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
}

function isChrome() {
  return window.chrome !== null && typeof window.chrome !== "undefined" && navigator.vendor === "Google Inc." && typeof window.opr === "undefined" && navigator.userAgent.indexOf("Edg") === -1;
}

function isAndroidChrome() {
  return isChrome() && /Android/i.test(navigator.userAgent);
}

function removeDupeWhitespace(str) {
  return str.replace(/\s+/g, " ");
}

function fixBracketSpaces(str) {
  // "( " -> "("
  var regex = /[ (\[><“‘$] /;
  var newStr;
  while (true) {
    var match = regex.exec(str);
    if (!match) return str;
    newStr = str.split("");
    newStr.splice(match.index + 1, 1);
    str = newStr.join("");
  }
}

function fixGrammarSpaces(str) {
  //e.g. This is a test . -> This is a test.
  var regex = /[A-Za-z0-9](\s)[.!,?;)’”]/g;
  var newStr;
  while (true) {
    var match = regex.exec(str);
    if (!match) return fixColonSpaces(str);
    newStr = str.split("");
    newStr.splice(match.index + 1, 1);
    str = newStr.join("");
  }
}

function replaceAt(str, index, char) {
  var arr = str.split("");
  arr[index] = char;
  return arr.join("");
}


function fixColonSpaces(str) {
  // I :) everyday -> no change
  // I am: happy -> no change
  // I am : happy -> I am: happy
  var regex = /[A-Za-z0-9](\s):(.)/g;
  var newStr;
  while (true) {
    var match = regex.exec(str);
    if (!match) return str;
    var followingLetter = match[2];
    if (")(-'".indexOf(followingLetter) > -1) continue; //emoticon
    newStr = str.split("");
    newStr.splice(match.index + 1, 1);
    str = newStr.join("");
  }
}

function capitalizeText(str) {
  // . a -> . A
  
  var regex = /([.?!] )([a-z])/g;
  while (true) {
    var match = regex.exec(str);
    if (!match) return str;
    str = str.substring(0, match.index) + match[0].substring(0, 2) + str[match.index + 2].toUpperCase() + str.substring(match.index + 3);
  }
}

function addText(oldText, newText, insertPoint) {
  // Adds newText to oldText, keeping in mind spaces and grammar.
  
  //start with a space?
  if ((insertPoint !== 0) &&
      (!oldText[insertPoint - 1].match(/\s/)) &&
      (!newText[0].match(/\s/)) &&
      (newText[0].match(/([a-zA-z0-9])/) || newText.substring(0, 2).match(/(\:(\)|\())/))
     ) {
    oldText = oldText.splice(insertPoint, 0, " ");
    insertPoint += 1; //insert after the space
  }
  
  //end with a space?
  if (!(newText[newText.length - 1].match(/[ (\[><“‘]/)) && (oldText[insertPoint] !== " ")) {
    //commented out because it causes issues when mixing voice and keyboard typing
    //newText += " ";
  }
  
  //starting with punc. and need to remove a space from oldText?
  if (settings.commands) {
    newText = applyCommands(newText);
  }
  if (window.applyCustomCommands) {
    newText = window.applyCustomCommands(newText);
  }
  if (
    !newText.substring(0, 2).match(/(\:(\)|\())/) && //not an emotion
    newText[0].match(/[.!,?;)’”]/) &&
    (oldText[insertPoint - 1] === " ")
  ) {
    oldText = oldText.slice(0, insertPoint - 1) + oldText.slice(insertPoint);
  }
  
  newText = removeDupeWhitespace(newText);
  newText = fixGrammarSpaces(newText);
  newText = removeDupeWhitespace(newText);
  newText = fixBracketSpaces(newText);

  var startingNewSentence = false;
  // auto-capitalize this much:
  //      newText
  //   .............
  // 12NNNNNNNNNNNNN12
  // ^^ oldText     ^^ oldText
  if (oldText.trim() === "") {
    //capitalize the first letter
    newText = newText.splice(0, 1, newText[0].toUpperCase());
  }
  var textToCapitalize = oldText.substr(insertPoint - 2, 2) + newText + oldText.substr(insertPoint, 2);
  // remove capitalized text
  oldText = oldText.substring(0, insertPoint - 2) + oldText.substr(insertPoint + 2, oldText.length);
  var capitalizedText = capitalizeText(textToCapitalize);
  oldText = oldText.splice(insertPoint - 2, 0, capitalizedText);
  
  return {
    text: oldText,
    newFrom: insertPoint,
    newTo: insertPoint + newText.length
  };
}

function applyCommands(text) {
  var checkRegex;
  var regexResult;
  var nextLetter;
  
  for (var i = 0; i < commands.length; i++) {
    if (text.toLowerCase().indexOf(" " + commands[i][0].toLowerCase()) > -1) {
      checkRegex = new RegExp(" " + commands[i][0], "i");
      var regexResult = checkRegex.exec(text);
      var nextLetter = text[regexResult.index + 1 + commands[i][0].length];
      checkRegex.lastIndex = 0;
      if (!nextLetter || !(nextLetter.match(/[a-zA-Z0-9]/))) {
        return applyCommands(text.replace(checkRegex, " " + commands[i][1]));
      }
    }
    if (text.toLowerCase().indexOf(commands[i][0].toLowerCase()) === 0) {
      checkRegex = new RegExp(commands[i][0], "i");
      regexResult = checkRegex.exec(text);
      nextLetter = text[regexResult.index + commands[i][0].length];
      checkRegex.lastIndex = 0;
      if (!nextLetter || !(nextLetter.match(/[a-zA-Z0-9]/))) {
        return applyCommands(text.replace(checkRegex, commands[i][1]));
      }
    }
  }
  return text;
}

var settings;
if (localStorage && localStorage["bd-settings"]) {
  settings = JSON.parse(localStorage["bd-settings"]);
  if (!settings.theme) {
    settings.theme = "light";
  }
  if (!settings.fontSize) {
    settings.fontSize = 12;
  }
} else {
  settings = {
    lang: navigator.language.split("-")[0],
    textDir: "ltr",
    showPendingText: true,
    autosave: true,
    commands: true,
    theme: "light",
    fontSize: 12,
  }
}
applySettings();

function readSettings() {
  settings.lang = document.getElementById("lang").value;
  settings.textDir = document.getElementById("text-dir").value;
  settings.theme = document.getElementById("theme").value;
  settings.fontSize = (document.getElementById("font-size").value === "") ? -1 : parseInt(document.getElementById("font-size").value, 10);
  settings.showPendingText = document.getElementById("show-pending-text").checked;
  settings.autosave = document.getElementById("autosave").checked;
  settings.commands = document.getElementById("voice-commands").checked;
  localStorage["bd-settings"] = JSON.stringify(settings);
  onSettingsChangeCbs.forEach(cb => cb());
}

function applySettings() {
  localStorage["bd-settings"] = JSON.stringify(settings);
  
  document.getElementById("show-pending-text").checked = settings.showPendingText;
  document.getElementById("text-dir").value = settings.textDir;
  document.getElementById("lang").value = settings.lang;
  document.getElementById("autosave").checked = settings.autosave;
  document.getElementById("voice-commands").checked = settings.commands;
  document.getElementById("theme").value = settings.theme;
  document.getElementById("font-size").value = (settings.fontSize === -1) ? "" : settings.fontSize;
  
  document.getElementById("dictation-text").dir = settings.textDir;
  document.getElementById("pending-text-overlay").dir = settings.textDir;
}

var onSettingsChangeCbs = [];
function onSettingsChange(cb) {
  onSettingsChangeCbs.push(cb);
}

function readThenApply() {
  readSettings();
  applySettings();
}

document.getElementById("show-pending-text").addEventListener("change", readThenApply);
document.getElementById("show-pending-text").addEventListener("click", readThenApply);
document.getElementById("autosave").addEventListener("change", readThenApply);
document.getElementById("autosave").addEventListener("click", readThenApply);
document.getElementById("voice-commands").addEventListener("change", readThenApply);
document.getElementById("voice-commands").addEventListener("click", readThenApply);
document.getElementById("text-dir").addEventListener("change", readThenApply);
document.getElementById("lang").addEventListener("change", readThenApply);
document.getElementById("theme").addEventListener("change", readThenApply);
document.getElementById("font-size").addEventListener("change", readThenApply);
document.getElementById("font-size").addEventListener("input", readThenApply);
