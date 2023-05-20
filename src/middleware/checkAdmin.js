const ADMINS = process.env.ADMINS

function checkAdmin(ctx, next) {
  // if (ADMINS.includes(ctx.chat.id)) {
  //   return next()
  // }
  // ctx
  //   .reply('bot is under development. acces denied')
  //   .catch(err => console.error('error:' + err))
  // return null
  return next()
}

module.exports = { checkAdmin }
