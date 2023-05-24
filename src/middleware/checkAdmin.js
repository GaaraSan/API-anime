const ADMINS = process.env.ADMINS

function checkAdmin(ctx, next) {
  if (ADMINS.includes(ctx.chat.id)) {
    return next()
  }
  ctx.reply('acces denied').catch(err => console.error('error:' + err))
  return null
}

module.exports = { checkAdmin }
