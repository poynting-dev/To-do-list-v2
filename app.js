//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://id-password/@cluster0.nuayu.mongodb.net/DBname", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-do list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<---- Hit this to delete an item."
});

let defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.deleteMany({}, function(err) {
//   if(err)
//     console.log("err");
//   else
//     console.log("Deleted all items in the DB.")
// })



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if(foundItems.length == 0)
    {
      Item.insertMany(defaultItems, function(err) {
        if(err)
          console.log("err");
        else
          console.log("Successfully saved default items in the DB.")
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });

});

app.get("/:customListName", function(req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList)
      {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }  
      else {
      //Show an existing list
      
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;


    const item1 = new Item({
      name: item
    });

    if(listName === "Today")
    {
      if(item1.name === "")
      {
        res.redirect("/");
      } else {
        item1.save();
      // Item.insertMany([item1], function(err) {
      //   if(err)
      //     console.log("err");
      //   else
      //     console.log("Successfully saved default items in the DB.")
      // });

        res.redirect("/");
      }
      
    } else {

      if(item1.name === "")
      {
        res.redirect("/" + listName);
      } else {

        List.findOne({name: listName}, function(err, foundList) {
          foundList.items.push(item1);
          foundList.save();
          res.redirect("/" + listName);
        });
    }
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove({_id: checkedItemId}, function(err) {
    if(!err) {
      console.log("Successfully deleted checked item.")
      res.redirect("/");
    }
  });
  } else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
    if(!err) {
      console.log("Successfully deleted checked item.")
      res.redirect("/" + listName);
    }
  });
  }


  // Item.findByIdAndRemove({_id: checkedItemId}, function(err) {
  //     if(err)
  //       console.log("err");
  //     else
  //       console.log("Item deleted in the DB.")
  //   });
  // res.redirect("/");
});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
