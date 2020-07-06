// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

document.fs.readdir("./notes/", populateExisting);

$("#edit-page").hide();
$("#browse").on("click", browseFiles);

function browseFiles() {
  document.fs.readdir("./notes/", populateExisting);
  $("#browse-page").show();
  $("#edit-page").hide();
  return false;
}

$("#makenew").on("click", editNew);

$("#delete").on("click", deleteNote);

function deleteNote(e) {
  let filename = document.getElementById("filename").innerHTML;
  let path = "./notes/" + filename;
  console.log("deleting: " + path);
  document.fs.unlinkSync(path);
  browseFiles();
  return false;
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

function populateExisting(err, files) {
  let parent = document.getElementById("existing");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  for (const s of files) {
    let filedata = JSON.parse(document.fs.readFileSync("./notes/" + s));
    console.log(filedata);

    let but = document.createElement("button");
    but.innerHTML = filedata.title;
    but.className = "edit-existing";
    but.fileName = s;
    but.fileData = filedata;

    but.onclick = editExisting;
    document.getElementById("existing").appendChild(but);
    document
      .getElementById("existing")
      .appendChild(document.createElement("br"));
  }
}
