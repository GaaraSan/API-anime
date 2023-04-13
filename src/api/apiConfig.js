const DEFAULT_SEARCH_ARGS = {
  page: 1,
  size: 100,
  sortBy: 'ranking',
  sortOrder: 'asc'
}

const DEFAULT_HEADERS = new Headers()

DEFAULT_HEADERS.append('X-RapidAPI-Key', process.env.API_TOKEN)
DEFAULT_HEADERS.append('X-RapidAPI-Host', 'anime-db.p.rapidapi.com')

module.exports = { DEFAULT_SEARCH_ARGS, DEFAULT_HEADERS }
