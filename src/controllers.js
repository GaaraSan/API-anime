const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect('mongodb://localhost:27017/anicat_db')

const User = require('./models/User.js')
const Anime = require('./models/Anime.js')

async function findOrAddUser(chatId) {
  if (typeof chatId !== 'number') {
    throw new Error('findOrAddUser chatId error')
  }

  const resultUser = await User.findOne({ chatId: chatId })

  if (resultUser === null) {
    const newUser = await new User({
      chatId: chatId,
      animelist: {
        watched: [],
        nowWatching: [],
        willWatch: []
      }
    }).save()
    return newUser._id
  }
  return resultUser._id
}

async function findOrAddAnime(
  title,
  description,
  episodesCount,
  genres,
  linkPhoto,
  linkWebsite
) {
  const resultAnime = await Anime.findOne({
    title: title,
    description: description,
    episodesCount: episodesCount,
    genres: genres,
    linkPhoto: linkPhoto,
    linkWebsite: linkWebsite
  })

  if (resultAnime === null) {
    const newAnime = await new Anime({
      title: title,
      description: description,
      episodesCount: episodesCount,
      genres: genres,
      linkPhoto: linkPhoto,
      linkWebsite: linkWebsite
    }).save()

    return newAnime._id
  }
  return resultAnime._id
}

async function addAnimeInUserSaves(userId, animeId, category) {
  switch (category) {
    case 'addWatched':
      await User.updateOne(
        { _id: userId },
        {
          $addToSet: { 'animelist.watched': animeId }
        },
        { new: true }
      )
      break
    case 'addNowWatching':
      await User.updateOne(
        { _id: userId },
        {
          $addToSet: { 'animelist.nowWatching': animeId }
        },
        { new: true }
      )
      break
    case 'addWillWatch':
      await User.updateOne(
        { _id: userId },
        {
          $addToSet: { 'animelist.willWatch': animeId }
        },
        { new: true }
      )
      break
    default:
      console.log('Switch errror')
      break
  }
}

async function getUserAnimes(chatId) {
  return await User.findOne(
    { chatId: chatId },
    { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
  ).populate({
    path: 'animelist',
    populate: [
      {
        path: 'watched'
      },
      {
        path: 'nowWatching'
      },
      {
        path: 'willWatch'
      }
    ]
  })
}

async function getAnime(animeId) {
  return await Anime.findOne(
    { _id: animeId },
    { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
  )
}

async function deleteUserAnime(chatId, category, animeId) {
  switch (category) {
    case 'deleteWatched':
      await User.updateOne(
        { _id: chatId },
        {
          $pull: { 'animelist.watched': animeId }
        },
        { new: true }
      )
      break
    case 'deleteNowWatching':
      await User.updateOne(
        { _id: chatId },
        {
          $pull: { 'animelist.nowWatching': animeId }
        },
        { new: true }
      )
      break
    case 'deleteWillWatch':
      await User.updateOne(
        { _id: chatId },
        {
          $pull: { 'animelist.willWatch': animeId }
        },
        { new: true }
      )
      break
    default:
      console.log('delete switch errror')
      break
  }
}

async function moveUserAnime(chatId, category, animeId, toCategory) {
  await deleteUserAnime(chatId, category, animeId)
  await addAnimeInUserSaves(chatId, animeId, toCategory)
}

module.exports = {
  findOrAddUser,
  findOrAddAnime,
  addAnimeInUserSaves,
  getUserAnimes,
  getAnime,
  deleteUserAnime,
  moveUserAnime
}
