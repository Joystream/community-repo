/* global api, hashing, keyring, types, util */

// run this script with:
// yarn script exportDataDirectory
//
// or copy and paste the code into the pioneer javascript toolbox at:
// https://testnet.joystream.org/#/js

const script = async ({ api, hashing, keyring, types, util }) => {

  console.log('Getting information from data directory. This may take a while')
  const dataDirObjects = await api.query.dataDirectory.dataByContentId.entries()

  let transformed = await Promise.all(dataDirObjects.map(async (obj) => {
    if (obj.isNone) { return null }

    return [obj[0], {
      owner: obj[1].owner,
      added_at: obj[1].added_at,
      type_id: obj[1].type_id,
      size: obj[1].size,
      liaison_judgement: obj[1].liaison,
      liaison_judgement: obj[1].liaison_judgement,
      ipfs_content_id: obj[1].ipfs_content_id }]
  }))

  console.log(JSON.stringify(transformed))
  console.error(`Exported ${transformed.length} objects`)
}

if (typeof module === 'undefined') {
  // Pioneer js-toolbox
  script({ api, hashing, keyring, types, util })
} else {
  // Node
  module.exports = script
}
