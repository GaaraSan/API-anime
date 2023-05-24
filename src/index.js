require('dotenv').config()
const Telegraf = require('telegraf').Telegraf
const LocalSession = require('telegraf-session-local')
const {
  findOrAddUser,
  findOrAddAnime,
  addAnimeInUserSaves,
  getUserAnimes,
  getAnime,
  deleteUserAnime,
  moveUserAnime,
  usersCount
} = require('./controllers.js')
const { searchByName } = require('./api/searchByName')
const { searchByGenre } = require('./api/searchByGenre')
const { checkAdmin } = require('./middleware/checkAdmin')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(new LocalSession({ database: 'usersSearchType.json' }).middleware())

bot.command('usersCount', checkAdmin, ctx => usersCount(ctx))

let chunkSize = 8

const getNavigateButtons = (currentPage, allPages) => {
  return [
    { text: '<', callback_data: `list-back-${currentPage}` },
    { text: `(${currentPage + 1}/${allPages})`, callback_data: '0' },
    { text: '>', callback_data: `list-next-${currentPage}` }
  ]
}
const getDbNavigateButtons = (currentPage, allPages) => {
  return [
    { text: '<', callback_data: `list-db-back-${currentPage}` },
    { text: `(${currentPage + 1}/${allPages})`, callback_data: '0' },
    { text: '>', callback_data: `list-db-next-${currentPage}` }
  ]
}

const mainButtons = () => {
  return [{ text: 'Search anime' }, { text: 'My anime list' }]
}

function sliceIntoChunks(store, chunkSize) {
  const res = []

  for (let i = 0; i < store.length; i += chunkSize) {
    const chunk = store.slice(i, i + chunkSize)
    res.push(chunk)
  }

  return res
}

const setStoreAnimesByName = (ctx, animeName) => {
  ctx.session.store = ctx.session.store || {}
  return searchByName(animeName).then(data => {
    ctx.session.store.animes = data.data
  })
}

const setStoreAnimesByGenre = (ctx, animeGenre) => {
  ctx.session.store = ctx.session.store || {}
  return searchByGenre(animeGenre).then(data => {
    ctx.session.store.animes = data.data
  })
}

const getButtonsById = (slicedArray, id) => {
  if (slicedArray !== undefined && slicedArray.length !== 0) {
    const array = slicedArray[id] // id должен быть внутри slicedArray

    const resultArray = array.map(item => {
      return [{ text: item.title, callback_data: `list-item-${item._id}` }]
    })

    return [...resultArray]
  } else {
    console.log('can`t map array')
    return []
  }
}

const getDbButtonsById = (slicedArray, id) => {
  if (slicedArray !== undefined && slicedArray.length !== 0) {
    const arrayDb = slicedArray[id] // id должен быть внутри slicedArray

    const resultDbArray = arrayDb.map(item => {
      return [{ text: item.title, callback_data: `list-db-item-${item._id}` }]
    })

    return [...resultDbArray]
  } else {
    console.log('can`t map array')
    return []
  }
}

bot
  .start(async ctx => {
    await findOrAddUser(ctx.chat.id)
    ctx
      .reply('Choose what the bot should do', {
        reply_markup: {
          keyboard: [mainButtons()],
          resize_keyboard: true
        }
      })
      .catch(err => console.error('error:' + err))
  })
  .catch(err => console.error('error:' + err))

bot.hears('Return', ctx => {
  ctx.reply('Choose what the bot should do', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})

bot.hears('Search anime', ctx => {
  ctx.reply('Select the criteria to search for anime', {
    reply_markup: {
      keyboard: [['By the name', 'By the genre'], ['Return']],
      resize_keyboard: true
    }
  })
})

bot.hears('My anime list', ctx => {
  ctx.reply('Select the category you are interested in', {
    reply_markup: {
      keyboard: [['Watched', 'Now watching', 'Will watch'], ['Return']],
      resize_keyboard: true
    }
  })
})

bot.hears('By the name', ctx => {
  ctx.reply('Enter the title')
  ctx.session.searchType = 'animeName'
})

bot.hears('By the genre', ctx => {
  ctx.session.searchType = 'animeGenre'

  ctx.replyWithHTML('Choose a genre from the proposed:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Award winning', callback_data: 'genre-Award_Winning' },
          { text: 'Sports', callback_data: 'genre-Sports' }
        ],
        [
          { text: 'Fantasy', callback_data: 'genre-Fantasy' },
          { text: 'Comedy', callback_data: 'genre-Comedy' }
        ],
        [
          { text: 'Adventure', callback_data: 'genre-Adventure' },
          { text: 'Action', callback_data: 'genre-Action' }
        ],
        [
          { text: 'Horror', callback_data: 'genre-Horror' },
          { text: 'Supernatural', callback_data: 'genre-Supernatural' }
        ],
        [
          { text: 'Drama', callback_data: 'genre-Drama' },
          { text: 'Mystery', callback_data: 'genre-Mystery' }
        ],
        [
          { text: 'Hentai', callback_data: 'genre-Hentai' },
          { text: 'Romance', callback_data: 'genre-Romance' }
        ]
      ]
    }
  })
})

let testCategory
bot.hears('Watched', async ctx => {
  ctx.session.dbStore = ctx.session.dbStore || {}
  ctx.session.dbStore.animes = (
    await getUserAnimes(ctx.chat.id)
  ).animelist.watched
  const slicedAnimes = sliceIntoChunks(ctx.session.dbStore.animes, chunkSize)
  let category = 'watched'

  const inline_keyboard = [
    ...getDbButtonsById(slicedAnimes, 0),
    getDbNavigateButtons(0, slicedAnimes.length)
  ]

  ctx.replyWithHTML(category, {
    reply_markup: {
      inline_keyboard: inline_keyboard
    }
  })
  testCategory = category
})

bot.hears('Now watching', async ctx => {
  ctx.session.dbStore = ctx.session.dbStore || {}
  ctx.session.dbStore.animes = (
    await getUserAnimes(ctx.chat.id)
  ).animelist.nowWatching
  const slicedAnimes = sliceIntoChunks(ctx.session.dbStore.animes, chunkSize)
  let category = 'nowWatching'

  const inline_keyboard = [
    ...getDbButtonsById(slicedAnimes, 0),
    getDbNavigateButtons(0, slicedAnimes.length)
  ]

  ctx.replyWithHTML(category, {
    reply_markup: {
      inline_keyboard: inline_keyboard
    }
  })
  testCategory = category
})

bot.hears('Will watch', async ctx => {
  ctx.session.dbStore = ctx.session.dbStore || {}
  ctx.session.dbStore.animes = (
    await getUserAnimes(ctx.chat.id)
  ).animelist.willWatch
  const slicedAnimes = sliceIntoChunks(ctx.session.dbStore.animes, chunkSize)
  let category = 'willWatch'

  const inline_keyboard = [
    ...getDbButtonsById(slicedAnimes, 0),
    getDbNavigateButtons(0, slicedAnimes.length)
  ]

  ctx.replyWithHTML(category, {
    reply_markup: {
      inline_keyboard: inline_keyboard
    }
  })
  testCategory = category
})

bot.action(/^genre-(\w+)/i, async ctx => {
  ctx.answerCbQuery()
  animeGenre = ctx.match[1].replace('_', ' ')

  await setStoreAnimesByGenre(ctx, animeGenre)
  const slicedAnimes = sliceIntoChunks(ctx.session.store.animes, chunkSize)

  const inline_keyboard = [
    ...getButtonsById(slicedAnimes, 0),
    getNavigateButtons(0, slicedAnimes.length)
  ]

  ctx.replyWithHTML(`${animeGenre}`, {
    reply_markup: {
      inline_keyboard: inline_keyboard
    }
  })
})

bot.action(
  messageText => {
    if (messageText.includes('list-back')) return true

    return false
  },
  ctx => {
    pageNumber = Number(ctx.callbackQuery.data.replace('list-back-', ''))
    if (pageNumber < 1) {
      pageNumber == 1
    } else {
      pageNumber--

      const slicedAnimes = sliceIntoChunks(ctx.session.store.animes, chunkSize)

      const inline_keyboard = [
        ...getButtonsById(slicedAnimes, pageNumber),
        getNavigateButtons(pageNumber, slicedAnimes.length)
      ]

      ctx.editMessageReplyMarkup({
        inline_keyboard
      })
    }
  }
)

bot.action(
  ctx => {
    if (ctx.includes('list-next')) return true

    return false
  },
  ctx => {
    let pageNumber = Number(ctx.callbackQuery.data.replace('list-next-', ''))
    const slicedAnimes = sliceIntoChunks(ctx.session.store.animes, chunkSize)

    if (pageNumber + 1 > slicedAnimes.length - 1) {
      pageNumber - 1 == slicedAnimes.length
    } else {
      pageNumber++

      const inline_keyboard = [
        ...getButtonsById(slicedAnimes, pageNumber),
        getNavigateButtons(pageNumber, slicedAnimes.length)
      ]

      ctx.editMessageReplyMarkup({
        inline_keyboard
      })
    }
  }
)

bot.action(
  messageText => {
    if (messageText.includes('list-db-back')) return true

    return false
  },
  ctx => {
    pageNumber = Number(ctx.callbackQuery.data.replace('list-db-back-', ''))
    if (pageNumber < 1) {
      pageNumber == 1
    } else {
      pageNumber--

      const slicedAnimes = sliceIntoChunks(
        ctx.session.dbStore.animes,
        chunkSize
      )

      const inline_keyboard = [
        ...getDbButtonsById(slicedAnimes, pageNumber),
        getDbNavigateButtons(pageNumber, slicedAnimes.length)
      ]

      ctx.editMessageReplyMarkup({
        inline_keyboard
      })
    }
  }
)

bot.action(
  ctx => {
    if (ctx.includes('list-db-next')) return true

    return false
  },
  ctx => {
    let pageNumber = Number(ctx.callbackQuery.data.replace('list-db-next-', ''))
    const slicedAnimes = sliceIntoChunks(ctx.session.dbStore.animes, chunkSize)

    if (pageNumber + 1 > slicedAnimes.length - 1) {
      pageNumber - 1 == slicedAnimes.length
    } else {
      pageNumber++

      const inline_keyboard = [
        ...getDbButtonsById(slicedAnimes, pageNumber),
        getDbNavigateButtons(pageNumber, slicedAnimes.length)
      ]

      ctx.editMessageReplyMarkup({
        inline_keyboard
      })
    }
  }
)

let animeInDB
let getAnimeDesription

bot.action(
  ctx => {
    if (ctx.includes('list-item')) return true

    return false
  },
  async ctx => {
    const id = ctx.callbackQuery.data.replace('list-item-', '')

    let singleAnime = ctx.session.store.animes.find(value => {
      return value._id === String(id)
    })

    const findAnime = await findOrAddAnime(
      singleAnime.title,
      singleAnime.synopsis,
      singleAnime.episodes,
      singleAnime.genres,
      singleAnime.image,
      singleAnime.link
    )
    const animeDesription = `${singleAnime.synopsis}`

    ctx.replyWithPhoto(
      { url: `${singleAnime.image}` },
      {
        caption: `Title:  ${singleAnime.title}\nGenres:  ${singleAnime.genres}\nEpisodes:  ${singleAnime.episodes}\n`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Description', callback_data: `getAnimeDesription` }],
            [
              {
                text: 'Link to myanimelist website',
                url: `${singleAnime.link}`
              }
            ],
            [
              { text: 'Watched', callback_data: 'addWatched' },
              { text: 'Now watching', callback_data: 'addNowWatching' },
              { text: 'Will watch', callback_data: `addWillWatch` }
            ]
          ]
        }
      }
    )
    animeInDB = findAnime
    getAnimeDesription = animeDesription
  }
)

let animeId
bot.action(
  ctx => {
    if (ctx.includes('list-db-item')) return true

    return false
  },
  async ctx => {
    const idDb = ctx.callbackQuery.data.replace('list-db-item-', '')
    let singleAnime = await getAnime(idDb)

    const animeDbDesription = `${singleAnime.description}`
    ctx.reply('Just a moment...')
    ctx.replyWithPhoto(
      { url: `${singleAnime.linkPhoto}` },
      {
        caption: `Title:  ${singleAnime.title}\nGenres:  ${singleAnime.genres}\nEpisodes:  ${singleAnime.episodesCount}\nList:  ${testCategory}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Description', callback_data: `getAnimeDesription` }],
            [
              {
                text: 'Link to myanimelist website',
                url: `${singleAnime.linkWebsite}`
              }
            ],
            [
              { text: 'Delete', callback_data: 'deleteUserAnime' },
              { text: 'Move', callback_data: 'removeUserAnime' }
            ]
          ]
        }
      }
    )
    getAnimeDesription = animeDbDesription
    animeId = idDb
  }
)

bot.action('deleteUserAnime', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)

  if (testCategory == 'watched') {
    await deleteUserAnime(userInDB, 'deleteWatched', animeId)
  }
  if (testCategory == 'nowWatching') {
    await deleteUserAnime(userInDB, 'deleteNowWatching', animeId)
  }
  if (testCategory == 'willWatch') {
    await deleteUserAnime(userInDB, 'deleteWillWatch', animeId)
  }
  ctx.reply('Deleted successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})

bot.action('removeUserAnime', ctx => {
  if (testCategory == 'watched') {
    ctx.reply('In witch list you wanna move this anime?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "In 'Now watching'", callback_data: 'removeToNowWatching' },
            { text: "In 'Will watch'", callback_data: 'removeToWillWatch' }
          ]
        ]
      }
    })
  }
  if (testCategory == 'nowWatching') {
    ctx.reply('In witch list you wanna move this anime?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "In 'Watched'", callback_data: 'removeToWatched' },
            { text: "In 'Will watch'", callback_data: 'removeToWillWatch' }
          ]
        ]
      }
    })
  }
  if (testCategory == 'willWatch') {
    ctx.reply('In witch list you wanna move this anime?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "In 'Now watching'", callback_data: 'removeToNowWatching' },
            { text: "In 'Watched'", callback_data: 'removeToWatched' }
          ]
        ]
      }
    })
  }
})

bot.action('removeToNowWatching', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  if (testCategory == 'watched') {
    await moveUserAnime(userInDB, 'deleteWatched', animeId, 'addNowWatching')
  }
  if (testCategory == 'willWatch') {
    await moveUserAnime(userInDB, 'deleteWillWatch', animeId, 'addNowWatching')
  }
  ctx.reply('Moved successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})
bot.action('removeToWillWatch', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  if (testCategory == 'watched') {
    await moveUserAnime(userInDB, 'deleteWatched', animeId, 'addWillWatch')
  }
  if (testCategory == 'nowWatching') {
    await moveUserAnime(userInDB, 'deleteNowWatching', animeId, 'addWillWatch')
  }
  ctx.reply('Moved successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})
bot.action('removeToWatched', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  if (testCategory == 'nowWatching') {
    await moveUserAnime(userInDB, 'deleteNowWatching', animeId, 'addWatched')
  }
  if (testCategory == 'willWatch') {
    await moveUserAnime(userInDB, 'deleteWillWatch', animeId, 'addWatched')
  }
  ctx.reply('Moved successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})

bot.action('getAnimeDesription', ctx => {
  ctx.reply(getAnimeDesription)
})

bot.action('addWatched', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  await addAnimeInUserSaves(userInDB, animeInDB, 'addWatched')
  ctx.reply('Add successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})
bot.action('addNowWatching', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  await addAnimeInUserSaves(userInDB, animeInDB, 'addNowWatching')
  ctx.reply('Add successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})
bot.action('addWillWatch', async ctx => {
  let userInDB = await findOrAddUser(ctx.from.id)
  await addAnimeInUserSaves(userInDB, animeInDB, 'addWillWatch')
  ctx.reply('Add successfuly', {
    reply_markup: {
      keyboard: [mainButtons()],
      resize_keyboard: true
    }
  })
})

bot.hears(/[A-Z]+/i, async ctx => {
  if (ctx.session.searchType === 'animeName') {
    let animeName = ctx.message.text.toLowerCase()

    await setStoreAnimesByName(ctx, animeName)

    const slicedAnimes = sliceIntoChunks(ctx.session.store.animes, chunkSize)

    const inline_keyboard = [
      ...getButtonsById(slicedAnimes, 0),
      getNavigateButtons(0, slicedAnimes.length)
    ]

    ctx.replyWithHTML(`${animeName}`, {
      reply_markup: {
        inline_keyboard: inline_keyboard
      }
    })
  } else {
    ctx
      .reply('I don`t understand you :c')
      .catch(err => console.error('error:' + err))
  }
})

bot.launch()
