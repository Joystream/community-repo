/* global api, hashing, keyring, types, util */

// run this script with:
// yarn script listDataDirectory
//
// or copy and paste the code into the pioneer javascript toolbox at:
// https://testnet.joystream.org/#/js
// requires nicaea release+

const script = async ({ api, joy }) => {
  console.log('Getting information from data directory. This may take a while')
  const dataDirObjects = await api.query.dataDirectory.dataByContentId.entries()

  await Promise.all(dataDirObjects.map(async (obj) => {
    if (obj.isNone) { return }
    console.log(`contentId: ${obj[0]}, ipfs: ${obj[1].ipfs_content_id}`)
  }))

  console.error(`Data Directory contains ${dataDirObjects.length} objects`)
}

if (typeof module === 'undefined') {
  // Pioneer js-toolbox
  script({ api, hashing, keyring, types, util, joy })
} else {
  // Node
  module.exports = script
}
