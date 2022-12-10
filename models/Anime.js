const mongoose = require("mongoose");

const Schema = mongoose.Schema
const model = mongoose.model

const animeSchema = new Schema(
	{
		title: {type: String, require: true},
		description: {type: String, require: true},
		episodesCount: {type: Number, require: true},
		genres: {type: [String], require: true},
		linkPhoto: {type: String, require: true},
		linkWebsite: {type: String, require: true}
	}
)

const Anime = model('Anime', animeSchema)

module.exports = Anime
