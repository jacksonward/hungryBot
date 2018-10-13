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
var locs = ['Au Bon Pain', 'Where the Wild Greens AR', 'Slim Chickens', 'Rustic Italian',
'Sushi with Gusto', 'Melt Lab', 'Pei Wei', 'Chick-Fil-A', 'Einstein Brother\'s Bagels',
'Peabody Perks', 'Quizno\'s', 'Rocket Taco', 'Starbucks', 'True Burger', 'Flying Burrito',
'Meal Trades'];

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

//Store interval for delaying initFunction to not overload live environment
var initInterval = 10000;

locs.forEach(function(el, index) {
  setTimeout(function() {
    initLocalMenus(el);
    console.log(el);
    console.log(localMenus);
    switch (el) {
      case "Melt Lab":
      localMenus[el.toLowerCase()]["meal trades"] = ["Sun-Thr: 6-11", "Any Classic Melt Combo"];
        break;
      case "Quizno\'s":
      localMenus[el.toLowerCase()]["meal trades"] = ["Sun-Sat: 6-9", "4\" Sandwich + Soup/Salad/Chips + Drink", "8\" Sandwich + Drink"];
        break;
      case "Rocket Taco":
      localMenus[el.toLowerCase()]["meal trades"] = ["Every Day: 6-9", "Rocket Taco Combo (3 Tacos, Rice + Beans)", "Nacho Combo + Drink"];
        break;
      case "Slim Chickens":
      localMenus[el.toLowerCase()]["meal trades"] = ["Sun-Thr: 6-10", "Fri & Sat: 6-9", "Chicks Plate, 6 Wing Plate, Sandwich/Salad/Wrap Plate + Drink"];
        break;
      case "Where the Wild Greens AR":
      localMenus[el.toLowerCase()]["meal trades"] = ["Every Day: 6-9", "Any menu entree (steak upgrade available) + Drink"];
        break;
      case "Chick-Fil-A":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Thr: 4-11", "Fri: 4:30-9", "Regular/Spicy/Char-Grilled Chicken Sandwich Combo", "12pc Nugget Combo"];
        break;
      case "Pei Wei":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Thr: 5-11", "Fri: 5-9", "Honey Seared Chicken/Pei Wei Original Chicken + Drink"];
        break;
      case "Rustic Italian":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Thr: 5-11", "Fri: 5-9", "2 Slices of Cheese/Pepperoni + Drink", "Choice of Pasta & Sauce + Drink"];
        break;
      case "True Burger":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Thr: 4:30-11", "Fri: 4:30-9", "Americana Combo + Drink"];
        break;
      case "Flying Burrito":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Thr: 5-11", "Fri: 5-9", "Chicken/Beef Nachos + Drink", "Chicken/Beef Rice Bowl + Drink", "Chicken/Beef Taco Salad + Drink", "2 Chicken/Beef Tacos + Drink"];
        break;
      case "Au Bon Pain":
      localMenus[el.toLowerCase()]["meal trades"] = ["Mon-Fri: 7am-8:30am", "Classic Breakfast Sandwich", "Large Oatmeal + Fruit", "Pastry + Fruit", "Egg White + Cheddar Sandwich",
      "All combos include any size coffee, 20oz Lemonade or Tea; Can upgrade to juice or milk"];
        break;
      case "Sushi with Gusto":
      localMenus[el.toLowerCase()]["meal trades"] = ["Every Day: 6-9", "Chicken Ramen + Drink", "California Roll + Drink", "Veggie Roll + Drink", "Spicy Shrimp Roll + Drink"];
        break;
      default:
    }
  }, index * initInterval);
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

//Catches for common misspellings
var cfaCatches = ['chickfila', 'chick fil a'];
var qCatches = ['quiznos'];
var wgCatches = ['wtwga', 'where the wild greens are', 'wild greens'];
var abpCatches = ['aubonpain', 'aubon pain', 'au bonpain'];

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
      //Catch common misspellings
      cfaCatches.forEach(misspelling => {
        if (message.startsWith("." + misspelling)) {
          message = message.replace(misspelling, "chick-fil-a");
        }
      })
      qCatches.forEach(misspelling => {
        if (message.startsWith("." + misspelling)) {
          message = message.replace(misspelling, "quizno\'s");
        }
      })
      wgCatches.forEach(misspelling => {
        if (message.startsWith("." + misspelling)) {
          message = message.replace(misspelling, "where the wild greens ar");
        }
      })
      abpCatches.forEach(misspelling => {
        if (message.startsWith("." + misspelling)) {
          message = message.replace(misspelling, "au bon pain");
        }
      })
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
