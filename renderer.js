// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

$("#browse").on("click", browseFiles);
browseFiles();

function browseFiles() {
  document.fs.readdir("./notes/", populateExisting);
  $("#browse-page").show();
  $("#edit-page").hide();
  return false;
}

$("#makenew").on("click", editNew);

$("#delete").on("click", deleteNoteFromEdit);

function deleteNoteFromEdit(e) {
  let filename = document.getElementById("filename").innerHTML;
  deleteNote(filename);
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

function editNew() {
  document.getElementById("filename").innerHTML = generateUnid() + ".json";
  document.getElementById("title").value = "";
  document.getElementById("text").value = "";
  $("#browse-page").hide();
  $("#edit-page").show();
  return false;
}

function editExisting(e) {
  document.getElementById("filename").innerHTML = e.target.fileName;
  document.getElementById("title").value = e.target.fileData.title;
  document.getElementById("text").value = e.target.fileData.text;
  $("#browse-page").hide();
  $("#edit-page").show();
  return false;
}

function writeFile() {
  var filename = "./notes/" + document.getElementById("filename").innerHTML;
  var filecontent = JSON.stringify({
    title: document.getElementById("title").value,
    text: document.getElementById("text").value
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

$("#title").on("input", writeFile);
$("#text").on("input", writeFile);

function getSortedFiles(files) {
  var out = [];
  for (const s of files) {
    let filedata = JSON.parse(document.fs.readFileSync("./notes/" + s));
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

  for (const file of getSortedFiles(files)) {
    addFileLink(file.filename, file.data.title, file.data);
  }
}
