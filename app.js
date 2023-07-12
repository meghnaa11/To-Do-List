const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let items = [];
let workItems = [];

app.get("/", function (req, res) {
  
  let day = date.getDate();
  res.render("list", { listTitle: day, newListItems: items });
});

// if we render inside post, we will get error bc newListItem will be undefined during the first get method so we do it with the kindOfDay
app.post("/", function(req, res) {
  let item = req.body.newItem;
  if(req.body.button === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
  
});

app.get("/work", function(req, res) {
  res.render("list", { listTitle: "Work Items", newListItems: workItems });
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  items.push(item);
  res.redirect("/work");
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
