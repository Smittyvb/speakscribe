if (!localStorage) window.localStorage = {};

var clEle = document.getElementById("command-list");

function onCommandUpdate() {
  if (!emptyRowAtBottom()) addEmptyRow();
  pruneExtraRows();
  save();
}
function onCommandInputKeyDown(e) {
  var leftSide = this.parentElement.nextElementSibling !== null;
  if (e.key === "ArrowUp") {
    if (!this.parentElement.parentElement.previousElementSibling) return;
    var upperSibling = this.parentElement.parentElement.previousElementSibling.children[leftSide ? 0 : 1].children[0];
    upperSibling.focus();
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (!this.parentElement.parentElement.nextElementSibling) return;
    var lowerSibling = this.parentElement.parentElement.nextElementSibling.children[leftSide ? 0 : 1].children[0];
    lowerSibling.focus();
    e.preventDefault();
  } else if ((e.key === "ArrowLeft") || (e.key === "Backspace")) {
    if (this.selectionStart !== this.selectionEnd) return;
    if (this.selectionStart !== 0) return;
    if (leftSide) {
      //go to right of upper item
      if (!this.parentElement.parentElement.previousElementSibling) return;
      var upperSibling = this.parentElement.parentElement.previousElementSibling.children[1].children[0];
      upperSibling.focus();
      e.preventDefault();
    } else {
      var left = this.parentElement.parentElement.children[0].children[0];
      left.focus();
      //sets cursor to end
      left.selectionStart = left.selectionEnd = left.value.length;
      e.preventDefault();
    }
  } else if (e.key === "ArrowRight") {
    if (this.selectionStart !== this.selectionEnd) return;
    if (this.selectionStart !== this.value.length) return;
    if (leftSide) {
      var right = this.parentElement.parentElement.children[1].children[0];
      right.focus();
      right.selectionStart = right.selectionEnd = 0;
    } else {
      if (!this.parentElement.parentElement.nextElementSibling) return;
      var lowerSibling = this.parentElement.parentElement.nextElementSibling.children[0].children[0];
      lowerSibling.focus();
    }
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (leftSide) {
      if (this.selectionStart !== this.selectionEnd) return;
      if (!leftSide) return;
      var right = this.parentElement.parentElement.children[1].children[0];
      right.focus();
      right.selectionStart = right.selectionEnd = 0;
    } else {
      if (!this.parentElement.parentElement.nextElementSibling) return;
      var lowerSibling = this.parentElement.parentElement.nextElementSibling.children[0].children[0];
      lowerSibling.focus();
    }
    e.preventDefault();
  }
}
function createTableCellInput(className) {
  var input = document.createElement("input");
  input.type = "text";
  input.classList.add(className);
  input.classList.add("table-input");
  input.addEventListener("input", onCommandUpdate);
  input.addEventListener("blur", onCommandUpdate);
  input.addEventListener("keydown", onCommandInputKeyDown);
  //input.addEventListener("change", onCommandUpdate);
  return input;
}
function createTableRow() {
  var tr = document.createElement("tr");
  var command = document.createElement("td");
  command.appendChild(createTableCellInput("command"));
  var replace = document.createElement("td");
  replace.appendChild(createTableCellInput("replace"));
  tr.appendChild(command);
  tr.appendChild(replace);
  return tr;
}

function emptyRowAtBottom() {
  if (clEle.rows.length === 0) return false;
  var lastRow = clEle.rows[clEle.rows.length - 1];
  if (
    lastRow.children[0].children[0].value !== "" ||
    lastRow.children[1].children[0].value !== ""
  ) return false;
  return true;
}
function addEmptyRow() {
  clEle.appendChild(createTableRow());
}
function pruneExtraRows() {
  for (var index = 0; index < clEle.children.length; index++) {
    var row = clEle.children[index];
    if (index === (clEle.rows.length - 1)) continue; // we want to keep the last, empty row
    if (document.activeElement === row.children[0].children[0]) return;
    if (document.activeElement === row.children[1].children[0]) return;
    if ((row.children[0].children[0].value === "") && (row.children[1].children[0].value === "")) {
      clEle.removeChild(row);
      return pruneExtraRows();
    }
  }
}

var data;
if (!localStorage["bd-custom-commands"]) {
  data = [];
} else {
  data = JSON.parse(localStorage["bd-custom-commands"]);
}
displayData(data);

function displayData(data) {
  clEle.innerHTML = "";
  data.forEach(function (line) {
    var tr = createTableRow();
    tr.children[0].children[0].value = line[0];
    tr.children[1].children[0].value = line[1];
    clEle.appendChild(tr);
  });
}
function save() {
  data = [];
  var rows = Array.from(clEle.rows);
  rows.forEach(function (row) {
    if (row.children[0].children[0].value === "" && row.children[1].children[0].value === "") return;
    data.push([row.children[0].children[0].value, row.children[1].children[0].value])
  });
  localStorage["bd-custom-commands"] = JSON.stringify(data);
}

addEmptyRow();

document.getElementById("x").addEventListener("click", function () {
  parent.postMessage("exit-custom-commands", location.origin);
});

function updateTheme() {
  var settings = {};
  if (localStorage["bd-settings"]) {
    settings = JSON.parse(localStorage["bd-settings"]);
  }
  var theme = settings.theme || "light";
  document.body.classList.remove("dark");
  document.body.classList.remove("light");
  document.body.classList.add(theme);
  
  if (window === top) {
    if (theme === "dark") {
      document.body.style.backgroundColor = "rgb(73, 74, 80)";
    } else {
      document.body.style.backgroundColor = "white";
    }
    document.getElementById("x").style.display = "none";
  }
}

window.addEventListener("storage", updateTheme);
updateTheme();
