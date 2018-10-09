var express = require('express');
var bodyParser = require('body-parser');
var port = 3000;
var request = require('request');
var app = express();

var Nightmare = require('nightmare');

const botId = "3b893bec87836682b56e1358bc";

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//This section below runs at startup to fetch static menus of on-campus eateries
var locs = ['Au Bon Pain', 'Where the Wild Greens AR',
'Sushi with Gusto', 'Melt Lab', 'Pei Wei', 'Chick-Fil-A', 'Einstein Brother\'s Bagels',
'Peabody Perks', 'Quiznos', 'Rocket Taco', 'Starbucks', 'True Burger'];

var localMenus = {};

function initLocalMenus(loc) {
  var loc = loc;
  localMenus[loc.toLowerCase()] = {};
  var nightmare = Nightmare({
  });
  nightmare
  .goto('https://www.dineoncampus.com/razorbacks/todays-menu')
  .wait('.form-control')
  .click('.form-control')
  .type('.form-control', `${loc}\u000d`)
  .wait('.category-name')
  .wait('.nav-tabs')
  .wait(1000)
  .evaluate(function(localMenus, loc) {
    var categories = document.querySelectorAll('.category-name');
    categories.forEach(function(category) {
      var cat = category.textContent.slice(7, (category.textContent.length - 5));
      localMenus[loc.toLowerCase()][cat.toLowerCase()] = [];
      var table = category.nextElementSibling.children[0].children[1];
      var items = table.children.length;
      for (i = 0; i < items; i++) {
        menuText = table.children[i].children[0].children[0].children[0].textContent;
        if (!(localMenus[loc.toLowerCase()][cat.toLowerCase()].includes(menuText))) {
          localMenus[loc.toLowerCase()][cat.toLowerCase()].push(menuText.slice(9, (menuText.length-7)));
        }
      }
    })
    return localMenus;
  }, localMenus, loc)
  .end((result) => {
    //Add individual eatery menu to localMenus object
    localMenus = Object.assign(localMenus, result);
    console.log("got another menu");
  })
  .catch(error => {
    console.error('Search failed:', error)
  })
}

locs.forEach(function(el) {
  initLocalMenus(el);
})

function getMenu(location, mealTime) {
  var nightmare = Nightmare({
  });
  var loc;
  var menu;
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
    return menuOptions;
  }, menu)
  .end((menuOptions) => {
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
      if (message.startsWith(".fulbright") || message.startsWith(".fullbright")) {
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
        getMenu(loc, time);
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
      getMenu(loc, time);
    } else {
      locs.forEach(function(el) {
        if (message.startsWith('.' + el.toLowerCase())) {
          var foundKey = false;
          for (var key in localMenus[el.toLowerCase()]) {
            if (message.includes(key.toLowerCase())) {
              foundKey = true;
              request.post(
                "https://api.groupme.com/v3/bots/post",
                { json: { "bot_id": botId, "text": `${capitalizeFirstLetter(el)} has the following ${key}: ${localMenus[el.toLowerCase()][key].join(', ')}.`}}
              );
            }
          }
          if (foundKey == false) {
            request.post(
              "https://api.groupme.com/v3/bots/post",
              { json: { "bot_id": botId, "text": `Please add one of the following menu categories to your search: ${Object.getOwnPropertyNames(localMenus[el.toLowerCase()]).join(', ')}`}}
            );
          }
        }
      })
    }
    }
  }
})

app.listen(port, () => console.log(`The Chef is listening on port ${port}!`))
