
// const client = require('../db')

// const setRecipeTileImage = (defaultTileImageKey, id) => {
//   return new Promise((resolve, reject) => {
//     client.query('UPDATE recipes SET default_tile_image_key=$1 WHERE id=$2',
//     [defaultTileImageKey, id],
//      (err, res) => {
//       if (err) return reject({success: false, error: err})
//       if (res.rowCount) {
//         return resolve({ success: true })
//       } else {
//         return reject({ success: false })
//       }
//    })
//   })
// }


// export { setRecipeTileImage }