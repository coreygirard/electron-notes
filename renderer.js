function navBrowse() {
  $("#browse-page").show();
  $("#edit-page").hide();
}

function navEdit() {
  $("#browse-page").hide();
  $("#edit-page").show();
}

function editNew() {
  document.current = {
    filename: generateUnid(),
    oldTitle: "",
    oldText: "",
    data: createNewCRDT()
  };

  CRDT2form(document.current);
  navEdit();
  return false;
}

function createNewCRDT() {
  return document.Automerge.from({
    title: new document.Automerge.Text(),
    text: new document.Automerge.Text()
  });
}

$("#title").on("input", handleTitleInput);
$("#text").on("input", handleTextInput);

function getTextDiff(type, a, b, sel) {
  let lenDiff = b.length - a.length;
  let out = [];
  if (type.startsWith("insert")) {
    for (var i = sel - lenDiff; i < sel; i++) {
      out.push(["insert", i, b[i]]);
    }
  } else if (type.startsWith("delete")) {
    for (var i = sel; i < sel - lenDiff; i++) {
      out.push(["delete", sel, a[i]]); // 'sel' because deletions shorten the string
    }
  }
  return out;
}

function handleTitleInput(e) {
  const delta = getTextDiff(
    e.originalEvent.inputType,
    document.current.oldTitle,
    document.getElementById("title").value,
    e.target.selectionStart
  );
  for ([type, i, data] of delta) {
    if (type === "insert") {
      document.current.data = document.Automerge.change(
        document.current.data,
        doc => {
          doc.title.insertAt(i, data);
        }
      );
    } else if (type === "delete") {
      document.current.data = document.Automerge.change(
        document.current.data,
        doc => {
          doc.title.deleteAt(i);
        }
      );
    } else {
      console.log("ERROR");
    }
  }
  document.current.oldTitle = document.getElementById("title").value;
  writePlain();
  writeCRDT();
}

function handleTextInput(e) {
  const delta = getTextDiff(
    e.originalEvent.inputType,
    document.current.oldText,
    document.getElementById("text").value,
    e.target.selectionStart
  );
  for ([type, i, data] of delta) {
    if (type === "insert") {
      document.current.data = document.Automerge.change(
        document.current.data,
        doc => {
          doc.text.insertAt(i, data);
        }
      );
    } else if (type === "delete") {
      document.current.data = document.Automerge.change(
        document.current.data,
        doc => {
          doc.text.deleteAt(i);
        }
      );
    } else {
      console.log("ERROR");
    }
  }
  document.current.oldText = document.getElementById("text").value;
  writePlain();
  writeCRDT();
}

function writePlain() {
  var filename = "./notes/" + document.current.filename + ".json";
  var filecontent = JSON.stringify({
    title: document.current.data.title.toString(),
    text: document.current.data.text.toString()
  });

  // write the filecontent to the selected file
  document.fs.writeFile(filename, filecontent, function(err) {
    if (err) {
      //return console.log(err);
    }
    return true;
  });
  return false;
}

function writeCRDT() {
  var filename = "./notes/" + document.current.filename + "_CRDT.json";
  var filecontent = document.Automerge.save(document.current.data);

  // write the filecontent to the selected file
  document.fs.writeFile(filename, filecontent, function(err) {
    if (err) {
      //return console.log(err);
    }
    return true;
  });
  return false;
}

// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------

function CRDT2form(c) {
  document.getElementById("filename").innerHTML = c.filename;
  document.getElementById("title").value = c.data.title;
  document.getElementById("text").value = c.data.text;
}

$("#browse").on("click", browseFiles);
$("#makenew").on("click", editNew);
$("#delete").on("click", deleteNoteFromEdit);
browseFiles();
editNew();

function browseFiles() {
  document.fs.readdir("./notes/", populateExisting);
  navBrowse();
  return false;
}

function deleteNoteFromEdit(e) {
  deleteNote(document.current.filename);
  browseFiles();
  return false;
}

function deleteNote(filename) {
  let path = "./notes/" + filename;
  document.fs.unlinkSync(path);
}

// https://gist.github.com/kevinbull/f1cbc5440aa713bd5c9e
function generateUnid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e10] + 1e10 + 1e9).replace(/[01]/g, generateUnid).toUpperCase();
}

function editExisting(e) {
  document.getElementById("filename").innerHTML = e.target.fileName;
  document.getElementById("title").value = e.target.fileData.title;
  document.getElementById("text").value = e.target.fileData.text;
  $("#browse-page").hide();
  $("#edit-page").show();
  return false;
}

function getSortedFiles(files) {
  var out = [];
  for (const s of files) {
    let filedata = document.Automerge.load(
      document.fs.readFileSync("./notes/" + s)
    );
    out.push({ filename: s, data: filedata });
  }
  out.sort((a, b) => {
    if (a.data.title < b.data.title) {
      return -1;
    } else if (a.data.title > b.data.title) {
      return 1;
    } else {
      return 0;
    }
  });
  return out;
}

function addFileLink(filename, title, data) {
  let but = document.createElement("button");
  but.innerHTML = title;
  but.className = "edit-existing";
  but.fileName = filename;
  but.fileData = data;
  but.onclick = editExisting;
  document.getElementById("existing").appendChild(but);

  let del = document.createElement("button");
  del.innerHTML = "X";
  del.className = "delete-existing";
  del.fileName = filename;
  del.onclick = () => {
    deleteNote(filename);
    browseFiles();
  };
  document.getElementById("existing").appendChild(del);

  document.getElementById("existing").appendChild(document.createElement("br"));
}

function populateExisting(err, files) {
  let parent = document.getElementById("existing");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  files = files.filter(s => {
    return s.endsWith("_CRDT.json");
  });

  for (const file of getSortedFiles(files)) {
    addFileLink(file.filename, file.data.title, file.data);
  }
}
