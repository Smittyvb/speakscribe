document.getElementById("dictation-text").focus();

if (!window.SpeechRecognition && window.webkitSpeechRecognition) {
  window.SpeechRecognition = window.webkitSpeechRecognition;
  window.SpeechGrammar = window.webkitSpeechGrammar;
  window.SpeechGrammarList = window.webkitSpeechGrammarList;
}

if (!window.SpeechRecognition) {
  alert("Sorry, your browser doesn't support speech recognition.");
}

var recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = settings.lang;
onSettingsChange(function () {
  recognition.lang = settings.lang;
  recognition.stop();
});
// android chrome has a bug where isFinal is always true
// https://bugs.chromium.org/p/chromium/issues/detail?id=457068
recognition.interimResults = !isAndroidChrome();
recognition.maxAlternatives = 1;

var pendingText = "";
var outputEle = document.getElementById("dictation-text");

window.textSync = true;
if (localStorage) {
  if (localStorage["bd-text"] && settings.autosave) {
    outputEle.value = localStorage["bd-text"];
  }
  function saveText() {
    if (!window.textSync) return;
    if (settings.autosave) {
      localStorage["bd-text"] = outputEle.value;
    }
  }
  setInterval(saveText, 700);
  onSettingsChange(function () {
    if (!settings.autosave) {
      localStorage["bd-text"] = "";
    }
  });
}

function stopRecogNow() {
  if (pendingText) {
    recognition.abort();
    outputEle.value = addText(outputEle.value, pendingText, outputEle.selectionStart).text;
    pendingText = "";
    showPending();
  }
}

function showMicRing() {
  var ring = document.createElement("div");
  ring.classList.add("mic-ring");
  document.getElementById("writing-area-container").appendChild(ring);
  setTimeout(function () {
    ring.remove();
  }, 5000);
}

outputEle.addEventListener("input", stopRecogNow);
outputEle.addEventListener("keydown", stopRecogNow);
outputEle.addEventListener("focus", stopRecogNow);
outputEle.addEventListener("mousedown", stopRecogNow);
outputEle.addEventListener("click", stopRecogNow);

var showPendingTop = true;

setInterval(function () {
  if (!navigator.onLine) {
    showPendingTop = false;
    document.getElementById("pending-text-top").innerText = "Warning: you are offline. Some things might not work."
  } else {
    if (!showPendingTop) document.getElementById("pending-text-top").innerText = "";
    showPendingTop = true;
  }
}, 333);

function showPending() {
  if (pendingText) {
    // *should* escape it right
    var escapedPendingText = pendingText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
    //old, new, insert
    var addedText = addText(outputEle.value, escapedPendingText, outputEle.selectionStart);
    var blueHtml = addedText.text.substr(0, addedText.newFrom) + "</span>" +
      addedText.text.substring(addedText.newFrom, addedText.newTo) +
      "<span class=\"base-color\">" +
      addedText.text.substr(addedText.newTo, addedText.text.length);
    blueHtml = "<span class=\"base-color\">" + blueHtml + "</span>";
    
    if ((settings.textDir === "ltr") && settings.showPendingText) {
      if (
        (outputEle.value === "") &&
        (pendingText !== "")
      ) {
        outputEle.placeholder = "";
      }
      document.getElementById("pending-text-overlay").style.display = "block";
      outputEle.style.color = "transparent";
      document.getElementById("pending-text-overlay").innerHTML = blueHtml;
    }
    if (showPendingTop) {
      document.getElementById("pending-text-top").innerText = pendingText;
    }
  } else {
    document.getElementById("pending-text-overlay").style.display = "none";
    document.getElementById("pending-text-overlay").innerHTML = "";
    document.getElementById("pending-text-top").innerHTML = "";
    outputEle.style.color = "inherit";
    outputEle.placeholder = "Press the microphone button at the bottom. Or, start typing.";
  }
}

recognition.onresult = function(event) {
  var results = event.results[0];
  var alts = [];
  for (var i = 0; i < results.length; i++) {
    alts.push(results[i]);
  }
  console.log(alts);
  // results.isFinal is always true on Chrome Android, so we have to work around that
  // https://bugs.chromium.org/p/chromium/issues/detail?id=457068
  if (results.isFinal) {
    recognition.stop();
    pendingText = "";
    if (localStorage) {
      var wordsSpoken = alts[0].transcript.split(" ").length;
      if (!localStorage["bd-total-words"]) localStorage["bd-total-words"] = "0";
      localStorage["bd-total-words"] = (parseInt(localStorage["bd-total-words"], 10) + wordsSpoken).toString();
    }
    showPending();
    outputEle.value = addText(outputEle.value, alts[0].transcript, outputEle.selectionStart).text;
  } else {
    pendingText = alts[0].transcript;
    showPending();
  }
};

recognition.onend = function(event) {
  if (!listening) return;
  recognition.start();
};

recognition.onerror = function(event) {
  switch (event.error) {
    case "not-allowed":
      var helpMessage;
      if (isChrome()) {
        helpMessage = "Press the green lock icon beside the reload button, then use the dropdown to allow microphone access.";
      } else {
        helpMessage = "Please enable microphone access in your browser.";
      }
      alert("It looks like we can't access your microphone. " + helpMessage);
      break;
    case "network":
      alert("Sorry, an Internet connection is needed so we can recognize your voice.");
      break;
    case "aborted": //mostly switching tabs, maybe the engine is locked up elsewhere
      return;
      break;
    case "no-speech": //we want to get back to listening
      if (!listening) return;
      console.log("Restarting recog after silence...");
      recognition.abort();
      return;
      break;
    case "audio-capture":
      alert("We couldn't record audio. Make sure your computer has a microphone.");
      break;
    case "language-not-supported":
      alert("It looks like your browser doesn't support the selected language.");
      break;
    case "service-not-allowed":
      alert("It looks like we're having trouble connecting to the speech recognition service.");
      break;
    default:
      alert("Oops! We hit an unknown error: " + event.error);
      break;
  }
  stopRecogNow()
  listening = false;
  document.getElementById("microphone").classList.remove("recording");
  console.log("Recog error", event);
};

var listening = false;
document.getElementById("microphone").addEventListener("click", function () {
  listening = !listening;
  if (listening) {
    recognition.start();
    //showMicRing();
    document.getElementById("microphone").classList.add("recording");
  } else {
    recognition.stop();
    document.getElementById("microphone").classList.remove("recording");
  }
});

document.getElementById("reset").addEventListener("click", function () {
  var canReset = confirm("Are you sure you want to delete everything?");
  if (!canReset) return;
  outputEle.value = "";
  if (localStorage) {
    localStorage["bd-text"] = "";
  }
  recognition.abort();
  pendingText = "";
  showPending();
  document.getElementById("dictation-text").focus();
});

var exporting = false;
document.getElementById("download").addEventListener("click", function () {
  exporting = !exporting;
  if (!exporting) {
    document.body.classList.remove("covered");
    document.body.classList.remove("show-export-diag");
    document.getElementById("dictation-text").focus();
  } else {
    document.body.classList.add("covered");
    document.body.classList.add("show-export-diag");
  }
});
document.getElementById("cover-overlay").addEventListener("click", function () {
  exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.body.classList.remove("show-custom-commands-diag");
  document.getElementById("dictation-text").focus();
});
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    exporting = false;
    document.body.classList.remove("covered");
    document.body.classList.remove("show-export-diag");
    document.body.classList.remove("show-custom-commands-diag");
    document.getElementById("dictation-text").focus();
  }
});
document.getElementById("export-x").addEventListener("click", function () {
  exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.getElementById("dictation-text").focus();
});

document.getElementById("clipboard-export").addEventListener("click", function () {
  navigator.clipboard.writeText(outputEle.value);
  exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.getElementById("dictation-text").focus();
});
document.getElementById("text-export").addEventListener("click", function () {
  var textBlob = new Blob([outputEle.value], {type: "text/plain"});
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(textBlob, "speakscribe.txt");
  } else {
    var ele = document.createElement("a");
    ele.href = URL.createObjectURL(textBlob);
    ele.download = "speakscribe.txt";        
    document.body.appendChild(ele);
    ele.click();        
    document.body.removeChild(ele);
  }
  exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.getElementById("dictation-text").focus();
});
document.getElementById("print-export").addEventListener("click", function () {
  print();
  exporting = false;
  document.body.classList.remove("covered");
  document.body.classList.remove("show-export-diag");
  document.getElementById("dictation-text").focus();
});

onerror = function (message, source, lineno, colno, error) {
  alert("Unknown error " + error);
};

window.addEventListener("message", function (msg) {
  console.log(msg);
  if (msg.origin !== location.origin) return;
  if (msg.data === "exit-custom-commands") {
    document.body.classList.remove("covered");
    document.body.classList.remove("show-export-diag");
    document.body.classList.remove("show-custom-commands-diag");
  }
});

function removeSearch() {
  if (window.history && window.history.replaceState) {
    history.replaceState("homepage", "SpeakScribe", location.href.split("?")[0]);
  } else {
    location.search = "";
  }
}

if (location.search) {
  try {
    var searchObject = {};
    var searchItems = location.search.split("?")[1].split("&");
    searchItems.forEach(function (item) {
      searchObject[item.split("=")[0]] = item.split("=")[1];
    });
    if (searchObject.reason && (searchObject.reason === "email-update")) {
      alert("Your email has been updated");
      removeSearch();
    } else if (searchObject.from && (searchObject.from === "cancel")) {
      alert("Your subscription has been cancelled.");
      removeSearch()
    } else if (searchObject.reason && (searchObject.reason === "card-updated")) {
      alert("Your card has been updated.");
      removeSearch()
    } else if (searchObject.reason && (searchObject.reason === "logout")) {
      alert("Your have been logged out.");
      removeSearch()
    }
  } catch (e) {}
}

(function () {
  if (!document.getElementById("logged-in-user-links")) return;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", function() {
    var json = JSON.parse(this.responseText);
    if (json.authed) {
      document.getElementById("logged-in-user-links").style.display = "inline";
      document.getElementById("pending-text-top").style.width = "calc(100vw - 30em)";
    } else {
      document.getElementById("logged-out-user-links").style.display = "inline";
    }
  });
  xhr.open("GET", "/login-info")
  xhr.send();
})();
setTimeout(function () {
  document.getElementById("dictation-text").style.transitionDuration = "0.5s";
}, 1000);
