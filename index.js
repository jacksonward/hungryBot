var express = require('express');
var bodyParser = require('body-parser');
var port = 3000;
var request = require('request');
var app = express();

var Nightmare = require('nightmare');

const botId = "3b893bec87836682b56e1358bc";
const htmlLoc = (__dirname + '/saveFile.html');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getMenu(location, mealTime) {
  var nightmare = Nightmare({
    // openDevTools: {
    //   mode: 'detach'
    // },
    show: true
  });
  var loc;
  var menu;
  console.log(mealTime);
  switch (location) {
    case "fulbright":
    loc = "Fulbright Dining Hall";
      break;
    case "brough":
    loc = "Brough Dining Hall";
      break;
    default:
    loc = "Fulbright Dining Hall"
  }
  if (loc == "Brough Dining Hall") {
    switch (mealTime) {
      case "breakfast":
      menu = ["Breakfast", "Culinary Table", "Pastry"];
      break;
      case "lunch":
      menu = ["Arkie Grub", "The Wok", "Platinum Grill", "Earthbound"];
      break;
      case "dinner":
      menu = ["Arkie Grub", "The Wok", "Platinum Grill", "Earthbound"];
      break;
      default:
      menu = ["Arkie Grub", "The Wok", "Platinum Grill", "Earthbound"];
    }
  }
  if (loc == "Fulbright Dining Hall") {
    switch (mealTime) {
      case "breakfast":
      menu = ["Breakfast", "Culinary Table", "Pastry"];
      break;
      case "lunch":
      menu = ["Entree", "Culinary Table"];
      break;
      case "dinner":
      menu = ["Entree", "Culinary Table"];
      break;
      default:
      menu = ["Entree", "Culinary Table"];
    }
  }
  nightmare
  .goto('https://www.dineoncampus.com/razorbacks/todays-menu')
  .wait('.form-control')
  .click('.form-control')
  .type('.form-control', `${loc}\u000d`)
  .wait('.category-name')
  .wait('.nav-tabs')
  .wait(1000)
  .evaluate((mealTime) => {
    var tabs = [];
    console.log(mealTime)
    for (i = 0; i < document.querySelector('.nav-tabs').children.length; i++) {
      tabs.push(document.querySelector('.nav-tabs').children[i]);
    }
    tabs.forEach(function(tabEl) {
      if (tabEl.children[0].textContent.toLowerCase() == mealTime) {
        tabEl.children[0].click();
      }
    })
  }, mealTime)
  .wait(3000)
  .evaluate(function(menu) {
    var categories = document.querySelectorAll('.category-name');
    var found1 = false;
    var found2 = false;
    var found3 = false;
    var menuOptions = [];
    menu.forEach(function(menuItem) {
      categories.forEach(function(category) {
        if (category.textContent.includes(menuItem)) {
          var table = category.nextElementSibling.children[0].children[1];
          var items = table.children.length;
          for (i = 0; i < items; i++) {
            menuText = table.children[i].children[0].children[0].children[0].textContent;
            if (!(menuOptions.includes(menuText))) {
              menuOptions.push(menuText);
            }
          }
        }
      })
    })
    // categories.forEach(function(category) {
    //   menu.forEach(function(menuItem) {
    //     if (category.textContent.includes(menuItem)) {
    //       var table = category.nextElementSibling.children[0].children[1];
    //       var items = table.children.length;
    //       for (i = 0; i < items; i++) {
    //         menuOptions.push(table.children[i].children[0].children[0].children[0].textContent)
    //       }
    //     }
    //   })
    // })
    return menuOptions;
  }, menu)
  .end((menuOptions) => {
    console.log(menu);
    console.log(menuOptions);
    if (menuOptions == null) {
      request.post(
        "https://api.groupme.com/v3/bots/post",
        { json: { "bot_id": botId, "text": `No ${capitalizeFirstLetter(mealTime)} at ${capitalizeFirstLetter(location)} today, it seems.`}}
      );
    } else {
      var options = [];
      menuOptions.forEach(function(option) {
        var slicedOption = option.slice(9, (option.length-7));
        options.push(slicedOption);
      })
      request.post(
        "https://api.groupme.com/v3/bots/post",
        { json: { "bot_id": botId, "text": `${capitalizeFirstLetter(mealTime)} at ${capitalizeFirstLetter(location)} will have the following: ${options.join(', ')}.`}}
      );
    }
  })
  // .html(__dirname + "/saveFile.html", "HTMLComplete")
  .catch(error => {
    console.error('Search failed:', error)
  })
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function(req, res) {
  var sender = req.body.name;
  var message = (req.body.text).toLowerCase();
  console.log("Got message from " + sender + " that says: " + message);
  if (!(sender == "hungryBot")) {
    if (message.startsWith(".")) {
      var loc, time;
      if (message.startsWith(".fulbright")) {
        loc = 'fulbright';
        if (message.includes('breakfast')) {
          time = 'breakfast';
        }
        if (message.includes('bekfist')) {
          time = 'bekfist';
        }
        if (message.includes('lunch')) {
          time = 'lunch';
        }
        if (message.includes('brunch')) {
          time = 'brunch';
        }
        if (message.includes('dinner')) {
          time = 'dinner';
        }
        if (message.includes('supper')) {
          time = 'supper';
        }
        if (message.includes('dindin')) {
          time = 'dindin';
        }
      }
    if (message.startsWith(".brough")) {
      loc = 'brough';
      if (message.includes('breakfast')) {
        time = 'breakfast';
      }
      if (message.includes('bekfist')) {
        time = 'bekfist';
      }
      if (message.includes('lunch')) {
        time = 'lunch';
      }
      if (message.includes('brunch')) {
        time = 'brunch';
      }
      if (message.includes('dinner')) {
        time = 'dinner';
      }
      if (message.includes('supper')) {
        time = 'supper';
      }
      if (message.includes('dindin')) {
        time = 'dindin';
      }
    }
      getMenu(loc, time);
    }
  }
})

app.listen(port, () => console.log(`The Chef is listening on port ${port}!`))
