(function() {
  function a(key, value) {
    var attr = document.createAttribute(key);
    attr.value = value;
    return attr;
  }
  function e(eleName, ...attrs) {
    var ele = document.createElement(eleName);
    attrs.forEach((attr, index) => {
      if (attr.toString() === "[object Attr]") {
        ele.setAttributeNode(attr);
      } else if (attr.toString() === "[object Text]") {
        ele.append(attr);
      } else if (attr.trigger && attr.on) {
        ele.addEventListener(attr.trigger, attr.on);
      } else {
        ele.appendChild(attr);
      }
    });
    return ele;
  }
  function t(text) {
    return document.createTextNode(text);
  }
  
  document.getElementById("dictation-text").style.width = "calc(100% - 1.32rem - 2rem - 2rem)";
  document.getElementById("dictation-text").style.left = "2rem";
  document.getElementById("pending-text-overlay").style.width = "calc(100% - 1.32rem - 2rem - 2rem)";
  document.getElementById("pending-text-overlay").style.left = "2rem";  

  document.getElementById("writing-area-container").prepend(e(
    "div",
    a("id", "files"),
    e(
      "label",
      a("class", "close-link"),
      a("for", "files-checkbox"),
      t("Close file list")
    ),
    e(
      "ul", 
      a("id", "file-list")
    )
  ));
  document.getElementById("writing-area-container").prepend(e(
    "label",
    a("id", "files-label"),
    a("for", "files-checkbox"),
    a("style", `
      position: absolute;
      background-color: #aeaeae;
      height: calc(100vh - 1px - 1.5em);
      width: 2em;
      cursor: pointer;
      left: 0;
      word-break: break-word;
      border-top-right-radius: 1em;
      border-bottom-right-radius: 1em;
      transition: left 0.5s;
    `),
    e(
      "img",
      a("src", "/assets/folder.svg"),
      a("alt", "Files")
    )
  ));
  document.getElementById("writing-area-container").prepend(e(
    "input",
    a("type", "checkbox"),
    a("id", "files-checkbox"),
    a("style", `
      position: absolute;
      top: 0;
      left: 0;
      height: 0;
      width: 0;
      margin: 0;
      opacity: 0;
    `)
  ));
  var styleEle = document.createElement("style");
  var fileEleWidth = "14rem";
  styleEle.innerHTML = `
    @media (max-width: 500px) {
      #settings-checkbox:checked ~ textarea,
      #settings-checkbox:checked ~ #pending-text-overlay,
      #settings-checkbox:checked ~ #files-label,
      #files-checkbox:checked ~ textarea,
      #files-checkbox:checked ~ #pending-text-overlay,
      #files-checkbox:checked ~ #files-label {
        /* gets too small */
        opacity: 0;
        border: none;
      }
      #settings-checkbox:checked ~ #settings {
        z-index: 60;
      }
      #files-checkbox:checked ~ #files {
        z-index: 60;
      }
      #settings-checkbox:checked ~ #microphone,
      #settings-checkbox:checked ~ .mic-side,
      #files-checkbox:checked ~ #microphone,
      #files-checkbox:checked ~ .mic-side {
        opacity: 0;
      }
    }
    @media (max-width: 665px) {
      #files-checkbox:checked ~ #settings-checkbox:checked ~ textarea, #files-checkbox:checked ~ #settings-checkbox:checked ~ #pending-text-overlay {
        display: none;
      }
    }
    #settings-checkbox:checked ~ textarea, #settings-checkbox:checked ~ #pending-text-overlay {
      width: calc(100% - 1.32rem - 2rem - 18rem - 2rem) !important;
    }
    #files-checkbox:checked ~ textarea, #files-checkbox:checked ~ #pending-text-overlay {
      width: calc(100% - 1.32rem - 2rem - ${fileEleWidth} - 2rem) !important;
      left: calc(${fileEleWidth} + 2em) !important;
    }
    #files-checkbox:checked ~ #settings-checkbox:checked ~ textarea, #files-checkbox:checked ~ #settings-checkbox:checked ~ #pending-text-overlay {
      width: calc(100% - 1.32rem - 2rem - 18rem - 2rem - ${fileEleWidth} - 2rem) !important;
    }
    #files {
      position: absolute;
      height: calc(100vh - 1px - 1.5em);
      width: ${fileEleWidth};
      left: -${fileEleWidth};
      transition-property: left, visibility;
      transition-duration: 0.5s;
      visibility: hidden;
      background: #ffbc70;
    }
    #files-checkbox:checked ~ #files {
      visibility: visible !important;
      left: 0 !important;
    }
    #files-checkbox:checked ~ #files-label {
      left: ${fileEleWidth} !important;
    }
    .file-listing-item, .new-file, #new-file-input-li {
      margin-left: 0.66em;
      color: blue;
      cursor: pointer;
      margin-bottom: 0.33em;
      width: 85%;
      height: 1.55em;
    }
    .file-listing-item span {
      padding-top: 0.24em;
      display: inline-block;
    }
    #new-file-input-li {
      color: black;
    }
    #file-list {
      list-style: none;
    }
    .new-file {
      color: #2e2e2e;
    }
    #files input {
      color: blue;
      background-color: #ffbc70;
      border: none;
      font-size: 1.03em;
      width: 8em;
    }
  `;
  document.head.appendChild(styleEle);
  function createFileEle(file, showDelete) {
    return e(
      "li",
      a("class", "file-listing-item"),
      a("data-file-id", file.id),
      e(
        "span",
        t(file.name)
      ),
      e(
        "img",
        a("src", "/assets/baseline-delete-24px.svg"),
        a("alt", "Delete"),
        a("class", "file-delete"),
        a("style", "float: right; height: 100%; height: 1.5em;" + (showDelete ? "" : "display: none;"))
      ),
      e(
        "img",
        a("src", "/assets/baseline-edit-24px.svg"),
        a("alt", "Rename"),
        a("class", "file-rename"),
        a("style", "float: right; height: 100%; height: 1.5em;")
      )
    )
  }
  function renderFiles() {
    document.getElementById("dictation-text").value = filesData.filter(function (file) {
      return file && (file.id === curFile);
    })[0].contents;
    var ul = e(
      "ul",
      a("id", "file-list")
    );
    filesData.forEach(function(file) {
      if (!file) return;
      var fileEle = createFileEle(file, filesData.length > 1);
      if (file.id === curFile) {
        fileEle.style.backgroundColor = "#ffff00";
      }
      ul.appendChild(fileEle);
    });
    ul.appendChild(e(
      "li",
      a("class", "new-file"),
      a("id", "new-file"),
      t("+ New file")
    ));
    ul.appendChild(e(
      "li",
      a("style", "display: none;"),
      a("id", "new-file-input-li"),
      e(
        "input",
        a("id", "new-file-input"),
        a("type", "text"),
        a("placeholder", "My New File"),
        a("maxlength", 14)
      )
    ));
    document.getElementById("file-list").innerHTML = ul.innerHTML;
    document.getElementById("new-file").addEventListener("click", function () {
      this.style.display = "none";
      document.getElementById("new-file-input-li").style.display = "list-item";
      document.getElementById("new-file-input").focus();
    });
    document.getElementById("new-file-input").addEventListener("blur", function () {
      if (this.value === "") {
        document.getElementById("new-file-input-li").style.display = "none";
        document.getElementById("new-file").style.display = "list-item";
      } else if (!ignoreBlur) {
        createFile();
      }
    });
    document.getElementById("new-file-input").addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        ignoreBlur = true;
        document.getElementById("new-file-input-li").style.display = "none";
        document.getElementById("new-file").style.display = "list-item";
        this.value = "";
        this.blur();
        ignoreBlur = false;
      }
      if ((event.key === "Enter") && (this.value === "")) {
        return this.blur();
      }
      if (event.key === "Enter") {
        ignoreBlur = true;
        createFile();
        ignoreBlur = false;
      }
    });
    document.querySelectorAll(".file-listing-item").forEach(function (ele) {
      ele.addEventListener("click", function () {
        saveFiles();
        curFile = this.dataset.fileId;
        renderFiles();
      });
    });
    document.querySelectorAll(".file-delete").forEach(function (deleteButton) {
      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        var index = filesData
          .filter(function (file) {
            return file;
          })
          .map(function (file, index) {
            file.index = index;
            return file;
          })
          .filter(function (file) {
            return file.id === deleteButton.parentElement.dataset.fileId;
          })[0].index;
        if (!confirm("Are you sure you want to delete " + filesData[index].name + "?")) return;
        filesData.splice(index, 1)
        var newIndex = index - 1;
        if (newIndex < 0) newIndex = 0;
        curFile = filesData[newIndex].id;
        document.getElementById("dictation-text").value = filesData.filter(function (file) {
          return file && (file.id === curFile);
        })[0].contents;
        saveFiles();
        renderFiles();
        saveFiles();
      });
    });
    document.querySelectorAll(".file-rename").forEach(function (renameButton) {
      var active = false;
      renameButton.addEventListener("click", function (event) {
        event.stopPropagation();
        if (active) {
          updateName();
          return;
        }
        var value = this.parentElement.innerText;
        //this.parentElement.children[0].style.paddingTop = "0";
        this.parentElement.children[0].innerHTML = e(
          "input",
          a("type", "text"),
          a("maxlength", 14)
        ).outerHTML;
        var input = this.parentElement.children[0].children[0];
        input.value = value;
        input.focus();
        input.select();
        var updated = false;
        function updateName() {
          if (updated) return;
          updated = true;
          if (input.value === "") {
            input.value = "Untitled";
          }
          var index = filesData
          .filter(function (file) {
            return file;
          })
          .map(function (file, index) {
            file.index = index;
            return file;
          })
          .filter(function (file) {
            return file.id === renameButton.parentElement.dataset.fileId;
          })[0].index;
          filesData[index].name = input.value;
          renameButton.parentElement.children[0].innerText = filesData[index].name;
          saveFiles();
        }
        input.addEventListener("blur", function () {
          updateName();
        });
        input.addEventListener("click", function (event) {
          event.stopPropagation();
        });
        input.addEventListener("keydown", function (event) {
          if ((event.key === "Escape") || (event.key === "Enter")) {
            updateName();
          }
        });
      });
    });
  }
  
  var curFile = localStorage["bd-cur-file-name"] ? localStorage["bd-cur-file-name"] : "firstfileid";
  var filesData = localStorage["bd-files"] ? 
    JSON.parse(localStorage["bd-files"]) :
    [
      {
        id: "firstfileid",
        contents: (localStorage["bd-text"] ? localStorage["bd-text"] : ""),
        name: "First file"
      }
    ];
  var save = true;
  function saveFiles() {
    if (!save) return;
    var index = filesData
      .filter(function (file) {
        return file;
      })
      .map(function (file, index) {
        file.index = index;
        return file;
      })
      .filter(function (file) {
        return file.id === curFile;
      })[0].index;
    filesData[index].contents = document.getElementById("dictation-text").value;
    localStorage["bd-cur-file-name"] = curFile;
    localStorage["bd-files"] = JSON.stringify(filesData);
  }
  saveFiles();
  renderFiles();
  setInterval(saveFiles, 1250);
  var ignoreBlur = false;
  function createFile() {
    var newName = document.getElementById("new-file-input").value;
    document.getElementById("new-file-input-li").style.display = "none";
    document.getElementById("new-file").style.display = "list-item";
    document.getElementById("new-file-input").blur();
    document.getElementById("new-file-input").value = "";
    document.getElementById("dictation-text").value = "";
    var id = Math.random().toString(36);
    filesData.push({
      id: id,
      contents: "",
      name: newName
    });
    curFile = id;
    saveFiles();
    renderFiles();
  }
  var cookies = {};
  document.cookie.split("; ").forEach(function (cookie) {
    cookies[cookie.split("=")[0]] = cookie.split("=")[1];
  });
  if (!window.ensureJsZip) window.ensureJsZip = function ensureJsZip(cb) {
    if (!window.JSZip) {
      var script = document.createElement('script');
      script.onload = cb ? cb : null;
      script.src = "jszip.min.js";
      document.head.appendChild(script);
    } else {
      if (cb) cb();
    }
  }
  
  document.getElementById("backup-item").style.display = "block";
  document.getElementById("backup-button").addEventListener("click", function () {
    ensureJsZip(function () {
      var zip = new window.JSZip();
      filesData.forEach(function (file) {
        zip.file(file.name + ".txt", file.contents);
      });
      zip.generateAsync({ type: "blob" }).then(function(blob) {
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, "speakscribe.zip");
        } else {
          var ele = document.createElement("a");
          ele.href = URL.createObjectURL(blob);
          ele.download = "speakscribe.zip";        
          document.body.appendChild(ele);
          ele.click();        
          document.body.removeChild(ele);
        }
      });
    });
  });
})();
