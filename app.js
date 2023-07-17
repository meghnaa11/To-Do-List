const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// let items = [];
// let workItems = [];

// DB 
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

// Create items: 
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

let day = date.getDate();

app.get("/", function (req, res) {

  Item.find()
    .then((items) => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved default items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
          // So it can go in the else condition and show the items in the list
          res.redirect("/");
      } else { 
        res.render("list", { listTitle: day, newListItems: items });
      }
      
    })
    .catch(function (err) {
      console.log(err);
    }); 
  
});

// if we render inside post, we will get error bc newListItem will be undefined during the first get method so we do it with the kindOfDay
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.button;
  // if(req.body.button === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  
  let item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day) {
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully deleted the item");
      res.redirect("/");
    })
    .catch(function (err) {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function () {
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }
  
});

app.get("/:customList", function(req, res) {
  const listName = _.capitalize(req.params.customList);
  List.findOne({name: listName}).then(function(foundList){
    if(foundList) {
      // Show an existing list
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    } else {
      // Create a new list
      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + listName);
    }
  })
  .catch(function (err) {
    console.log(err);
  }); 

  
  
});

 /*
// app.get("/work", function(req, res) {
//   res.render("list", { listTitle: "Work Items", newListItems: workItems });
// });

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  items.push(item);
  res.redirect("/work");
}); */

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
