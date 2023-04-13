const MASTERKEY = process.env.MASTERKEY

function checkAdmin(ctx, next) {
  if (ctx.chat.id == MASTERKEY) {
    return next()
  }
  ctx
    .reply('bot is under development. acces denied')
    .catch(err => console.error('error:' + err))
  return null
}

module.exports = { checkAdmin }
