const mongoose = require('mongoose')
const Anime = require('./Anime.js')

const Schema = mongoose.Schema
const model = mongoose.model

const userSchema = new Schema({
  chatId: { type: Number, require: true },
  animelist: {
    watched: { type: [Schema.Types.ObjectId], ref: Anime, require: true },
    nowWatching: { type: [Schema.Types.ObjectId], ref: Anime, require: true },
    willWatch: { type: [Schema.Types.ObjectId], ref: Anime, require: true }
  }
})

const User = model('User', userSchema)

module.exports = User
