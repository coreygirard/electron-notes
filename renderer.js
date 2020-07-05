// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

$("#myfirstview").hide();
$("#mysecondview").hide();

// on click show the second view
$("#showall").on("click", function() {
  $("#mysecondview").show(); // show the second view
  $("#myfirstview").hide(); // hide the first view
  return false;
});

$("#save-form").on("click", function() {
  console.log($("#email").val() + " " + $("#contact").val()); // getting input values
  return false;
});

const inputHandler = function(e) {
  console.log(e.target.value);
};

//const { dialog } = require("electron").remote;

//document.getElementById("email").addEventListener("input", inputHandler);

$("#title").on("input", function(e) {
  //var filename = $('#filename').val(); // get the filename
  //var filecontent = $('#fileconent').val(); // get the file contents

  var filename = "something.txt";
  var filecontent = e.target.value;

  // write the filecontent to the selected file
  document.fs.writeFile(filename, filecontent, function(err) {
    if (err) {
      //return console.log(err);
    }
    return true;
  });
  return false;
});
