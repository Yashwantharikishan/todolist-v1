// jsdhint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();


// connection to database .................
mongoose.connect('mongodb+srv://admin-yash:Test1234@cluster0.egrcbdv.mongodb.net/todolistDB');
console.log("MongoDB is connected.");

//mongodb+srv://admin-yash:Test1234@cluster0.egrcbdv.mongodb.net/?retryWrites=true&w=majority

// schema of collection........
const itemSchema = new mongoose.Schema({
  name: String
});

//Creating collection .......
const Item = mongoose.model('item',itemSchema);

//default items.....
const item1 = new Item({
  name: "welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

//default item array....
const defaultItems = [item1, item2, item3];

//list schema ......
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

//creating collection
const List = mongoose.model('List',listSchema);



app.set("view engine", 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
// let day = date.getDate();

//find the items..........
Item.find()
.then(function(Founditem){
  if(Founditem.length === 0){
//insert Default items.......
 Item.insertMany(defaultItems)
.then(function(){
  console.log('successfully inserted all the items.... to DATA BASE');
})
.catch(function(err){
  console.log(err);
});  
res.redirect("/");
} else{
    res.render("list", { listTitle: 'Today', newListItems:Founditem});
  }
    console.log("Found items.");
})
.catch(function(err){
  console.log(err);
});
});

// Custom list............
app.get("/:customListName", function(req, res){
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(FoundList){
      
       if(!FoundList){
        //console.log("Does't exist!");
        //Create a new list
        const list = new List({
          name: customListName,
          items:defaultItems
      
        });
        list.save();
        res.redirect("/" +customListName);
       }else{
        // console.log("Exists!");
        //show existing list
        res.render("list",{ listTitle: FoundList.name , newListItems:FoundList.items});
       }
  }).catch(function(err){
    console.log(err);
  });
  });

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
else{
  List.findOne({name: listName}).then(function(FoundList){
     FoundList.items.push(item);
     FoundList.save();
     res.redirect("/"+listName);
  })
}


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

 if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId).then(function(){
    console.log("Successfully deleted...");
    res.redirect('/');
  })
  .catch(function(err){
    console.log(err);
  });
 }
 else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}})
  .then(function(FoundList){
    res.redirect("/"+ listName);
  })
  .catch(function(err){
    console.log(err);
  });
 }

  
});




app.listen(3000,function() {
  console.log("Server started on port 3000");
});
