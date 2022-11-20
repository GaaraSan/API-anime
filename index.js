const Telegraf = require("telegraf").Telegraf;
const bot = new Telegraf("5623236109:AAEEeeXtS1BEM9tsLjTRpXu_F2QfC8jcyVY");

bot.start((ctx) => ctx.reply('Welcome'));

let store = {};

function searchByName(animeName) {
    let page = 1,
        size = 3,
        sortBy = 'ranking',
        sortOrder = 'asc';
    return fetch(`https://anime-db.p.rapidapi.com/anime?page=${page}&size=${size}&search=${animeName}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'bc32b4b7e8msh80bec6c4d847f76p1860bbjsn6f70a022a087',
            'X-RapidAPI-Host': 'anime-db.p.rapidapi.com',
        }})
        .then(res => res.json())
	    .catch(err => console.error('error:' + err));
}

const checkKeyInStore = key => {
  return Object.keys(store).includes(key);
}

bot.hears(/[A-Z]+/i, ctx => {
  let animeName = ctx.message.text.toLowerCase();

  if (!checkKeyInStore(animeName)) {
    console.log('---------- Go to server ----------');
    searchByName(animeName).then(data => {
      store[animeName] = data
      console.log('server data:', data)
      ctx.reply('Search by ' + animeName + ': ' + JSON.stringify(data))
    });
  } else {
    console.log('---------- Don`t go to server ----------');
    console.log(store);
    ctx.reply('Search by ' + animeName + ': ' + JSON.stringify(store[animeName]));
  }
})

bot.launch();