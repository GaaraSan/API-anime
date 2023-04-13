const { DEFAULT_SEARCH_ARGS, DEFAULT_HEADERS } = require('./api.config')

const API_LINK = process.env.API_LINK

function searchByGenre(animeGenre, options = DEFAULT_SEARCH_ARGS) {
  return fetch(
    `${API_LINK}/anime?page=${options.page}&size=${options.size}&genres=${animeGenre}&sortBy=${options.sortBy}&sortOrder=${options.sortOrder}`,
    {
      method: 'GET',
      headers: DEFAULT_HEADERS
    }
  )
    .then(res => res.json())
    .catch(err => console.error('error:' + err))
}

module.exports = { searchByGenre }
