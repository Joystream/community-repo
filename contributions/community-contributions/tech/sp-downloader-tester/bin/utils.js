const { Text } = require('@polkadot/types')
const fsPromises = require('fs/promises')
const Path = require('path')
const { encodeAddress } = require('@polkadot/keyring')
const fs = require('fs')
const axios = require('axios')

function computeMedian(numbers) {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

async function generateListOfDataObjectsToDownload(api, nrSmall, nrBig) {
  const dataObjects = await getAcceptedDataObjects(api)

  const dataObjectsSortedBySize = dataObjects.sort((dataObject) => dataObject.size_in_bytes)

  const smallFiles = dataObjectsSortedBySize.slice(0, nrSmall)
  const bigFiles = dataObjectsSortedBySize.slice(-nrBig)
  return smallFiles.concat(bigFiles).map((dataObject) => dataObject.contentId)
}

async function getWorkerEndpoint(api, workerId) {
  const value = await api.query.storageWorkingGroup.workerStorage(workerId)
  return new Text(api.registry, value).toString()
}

async function getAcceptedDataObjects(api) {
  let mapObjects = await api.query.dataDirectory.dataByContentId.entries()

  mapObjects = mapObjects.filter(([, dataObject]) => dataObject.liaison_judgement.type === 'Accepted')
  const ids = mapToContentId(mapObjects)
  const dataObjects = mapObjects.map(([, dataObject]) => dataObject)
  const dataObjectsWithIds = []
  for (let i = 0; i < dataObjects.length; i++) {
    dataObjects[i].contentId = ids[i]
    dataObjectsWithIds.push(dataObjects[i])
  }
  return dataObjectsWithIds
}

async function clearFolder(folder) {
  const files = await fsPromises.readdir(folder)

  for (const file of files) {
    await fsPromises.unlink(Path.join(folder, file))
  }
}

function makeAssetUrl(contentId, source) {
  source = removeEndingForwardSlash(source)
  return `${source}/asset/v0/${encodeAddress(contentId)}`
}

function mapToContentId(dataObjects) {
  return dataObjects.map(
    ([
      {
        args: [contentId],
      },
    ]) => contentId
  )
}

async function downloadFile(url, outputFolder, outputFilename) {
  const path = Path.join(outputFolder, outputFilename)
  const writer = fs.createWriteStream(path)

  const start = process.hrtime.bigint()
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      const end = process.hrtime.bigint()
      resolve(Number(end - start) / 1000000)
    })
    writer.on('error', reject)
  })
}

async function getActiveWorkersIds(api) {
  const ids = []
  const entries = await api.query.storageWorkingGroup.workerById.entries()
  entries.forEach(([storageKey, worker]) => {
    if (worker.is_active) {
      const id = storageKey.args[0].toNumber()
      ids.push(id)
    }
  })

  return ids
}

function removeEndingForwardSlash(url) {
  if (url.endsWith('/')) {
    return url.substring(0, url.length - 1)
  }
  return url.toString()
}

module.exports = {
  getWorkerEndpoint,
  generateListOfDataObjectsToDownload,
  makeAssetUrl,
  downloadFile,
  computeMedian,
  clearFolder,
  getActiveWorkersIds
}
