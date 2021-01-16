(function () {
  var setCustomCommandIframeSrc = false;
  function loadCustomCommandsIframe() {
    if (!setCustomCommandIframeSrc) {
      setCustomCommandIframeSrc = true;
      document.getElementById("custom-commands-iframe").src = "/custom-commands.html";
    }
  }
  function doSingleCommandApplication(text, commands) {
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
          text = text.replace(checkRegex, " " + commands[i][1]);
          continue;
        }
      }
      if (text.toLowerCase().indexOf(commands[i][0].toLowerCase()) === 0) {
        checkRegex = new RegExp(commands[i][0], "i");
        regexResult = checkRegex.exec(text);
        nextLetter = text[regexResult.index + commands[i][0].length];
        checkRegex.lastIndex = 0;
        if (!nextLetter || !(nextLetter.match(/[a-zA-Z0-9]/))) {
          text = text.replace(checkRegex, commands[i][1]);
          continue;
        }
      }
    }
    return text;
  }
  
  window.applyCustomCommands = function applyCustomCommands(text) {
    // we can't use the same algo for our own commands, since custom commands could have loops
    // e.g. [["a", "b"], ["b", "a"]]
    // so we limit recursive command application to 51 runs
    // the number must be odd so "a" will become "b" and vice versa instead of nothing happening
    var newText;
    var commands = localStorage["bd-custom-commands"] ? JSON.parse(localStorage["bd-custom-commands"]) : [];
    for (var i = 0; i < 51; i++) {
      newText = doSingleCommandApplication(text, commands);
      if (newText === text) return newText; // no change
      text = newText;
    }
    return text;
  };
  
  document.getElementById("custom-commands-settings-item").style.display = "block";
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {}
  document.getElementById("setup-custom-commands-link").addEventListener("mouseover", function (e) {
    loadCustomCommandsIframe();
  }, supportsPassive ? false : {passive: true});
  document.getElementById("setup-custom-commands-link").addEventListener("mousedown", function (e) {
    loadCustomCommandsIframe();
  }, supportsPassive ? false : {passive: true});
  document.getElementById("setup-custom-commands-link").addEventListener("touchstart", function (e) {
    loadCustomCommandsIframe();
  });
  document.getElementById("settings-label").addEventListener("click", function (e) {
    //wait a bit, otherwise the animation lags
    setTimeout(loadCustomCommandsIframe, 3000);
  });
  document.getElementById("setup-custom-commands-link").addEventListener("click", function (e) {
    e.preventDefault();
    loadCustomCommandsIframe();
    document.body.classList.add("covered");
    document.body.classList.add("show-custom-commands-diag");
  });
})();
