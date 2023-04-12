const { Schema, model, ObjectId } = require('mongoose')
const Anime = require('./Anime.js')

const userSchema = new Schema({
  chatId: { type: Number, require: true },
  animelist: {
    watched: { type: [ObjectId], ref: Anime, require: true },
    nowWatching: { type: [ObjectId], ref: Anime, require: true },
    willWatch: { type: [ObjectId], ref: Anime, require: true }
  }
})

const User = model('User', userSchema)

module.exports = User
