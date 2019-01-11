# hungryBot
A GroupMe bot that scrapes a dynamic Vue website (dineoncampus) for menu options of dining halls on UARK campus
at the requested meal times.
For example, ".Fulbright lunch" will tell the bot to fetch today's lunch menu at Fulbright Dining Hall.
The bot will respond with a list of unique meal options that are on the menu.

On startup, hungryBot also fetches all the publicly accessible menus of places to eat on campus.
For example, you can find menu items and meal trade times of Chick-Fil-A by using '.chickfila meal trades'

hungryBot uses nightmare.js for browser automation and express/request for POST communication.
