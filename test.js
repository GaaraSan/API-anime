require('dotenv').config()
const Telegraf = require("telegraf").Telegraf;
const bot = new Telegraf(process.env.BOT_TOKEN);
const API_TOKEN = process.env.API_TOKEN

let store = [],
	flag = 'animeName',
	animeGenre = 'Horror',
	page = 1,
	size = 5,
	sortBy = 'ranking',
	sortOrder = 'asc';

bot.start(ctx => {
	ctx.replyWithHTML( "Оберіть за яким критерієм шукати аніме" , {
		reply_markup : {
			inline_keyboard: [
				[{text : "За назвою", callback_data: "searchByName"}],
				[{text : "За жанром", callback_data: "searchByGenre"}],
			]
		}
	});

})

bot.action("searchByName", ctx => {
	ctx.reply("Введіть назву англійською"); 
	flag = 'animeName';   
})

bot.action("searchByGenre", ctx => {
	flag = 'animeGenre';   
	ctx.replyWithHTML( "Оберіть жанр із запропонованих:" , {
		reply_markup : {
			inline_keyboard: [
				[{text : "Переможець нагород", callback_data: "awardWinning"},{text : "Спорт", callback_data: "sports"}],
				[{text : "Фантастика", callback_data: "fantasy"},{text : "Комедія", callback_data: "comedy"}],
				[{text : "Пригоди", callback_data: "adventure"},{text : "Бойовик", callback_data: "action"}],
				[{text : "Жахи", callback_data: "horror"},{text : "Надприродне", callback_data: "supernatural"}],
				[{text : "Драма", callback_data: "drama"},{text : "Містика", callback_data: "mystery"}],
				[{text : "Повсякденне життя", callback_data: "sliceOfLife"},{text : "Романтика", callback_data: "romance"}]
			]
		}
	});
})

bot.action("awardWinning", ctx => {
	animeGenre = 'Award Winning';
	console.log('dndfnmfl') 
})
///////////здесь можно перетянуть код bot.hears => else в каждый новый action, но думаю есть вариант лучше
function searchByName(animeName) {
	return fetch(`https://anime-db.p.rapidapi.com/anime?page=${page}&size=${size}&search=${animeName}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': API_TOKEN,
			'X-RapidAPI-Host': 'anime-db.p.rapidapi.com',
		}})
		.then(res => res.json())
		.catch(err => console.error('error:' + err));
}

function searchByGenre(animeGenre) {
	return fetch(`https://anime-db.p.rapidapi.com/anime?page=${page}&size=${size}&genres=${animeGenre}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': API_TOKEN,
			'X-RapidAPI-Host': 'anime-db.p.rapidapi.com',
		}})
		.then(res => res.json())
		.catch(err => console.error('error:' + err));
}

bot.hears(/[A-Z]+/i, ctx => {
	if (flag === 'animeName'){
		let animeName = ctx.message.text.toLowerCase();

		searchByName(animeName).then(data => {
			store = data.data;
			console.log('server data: ', data);
			for (let element of store){
				ctx.replyWithHTML(`Результат пошуку за назвою "${animeName}":\n  Назва: ${element["title"]}\n  Жанр: ${element["genres"]}\n  К-сть епізодів: ${element["episodes"]}\n  Посилання: ${element["link"]}`,{
					reply_markup : {
						inline_keyboard: [
							[{text : "Дивився", callback_data: "h"},{text : "Буду дивитися", callback_data: "g"},{text : "Дивлюсь", callback_data: "f"}]
						]
					}
				}
				// ctx.replyWithPhoto(`${element['image']}`);
			)}
		});
	} else {
		searchByGenre(animeGenre).then(data => {
			store = data.data;
			console.log('server data: ', data);
			for (let element of store){
				ctx.replyWithHTML(`Результат пошуку за жанром "${animeGenre}":\n  Назва: ${element["title"]}\n  Жанр: ${element["genres"]}\n  К-сть епізодів: ${element["episodes"]}\n  Посилання: ${element["link"]}`,{
					reply_markup : {
						inline_keyboard: [
							[{text : "Дивився", callback_data: "h"},{text : "Буду дивитися", callback_data: "g"},{text : "Дивлюсь", callback_data: "f"}]
						]
					}
				}
				// ctx.replyWithPhoto(`${element['image']}`);
			)}
		});
	}
})

bot.launch();