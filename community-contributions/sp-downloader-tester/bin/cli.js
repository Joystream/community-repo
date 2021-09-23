#!/usr/bin/env node

const { ContentId } = require('@joystream/types/storage')
const { ApiPromise, WsProvider } = require('@polkadot/api')
const { types } = require('@joystream/types')

const fsPromises = require('fs/promises')
const fs = require('fs')
const Path = require('path')

const {
  getActiveWorkersIds,
  getWorkerEndpoint,
  generateListOfDataObjectsToDownload,
  makeAssetUrl,
  downloadFile,
  clearFolder,
  computeMedian
} = require('./utils')

const { program } = require('commander')

const TEMP_FOLDER = Path.resolve(__dirname, '../', 'temp')
const PROVIDER_URL = 'wss://rome-rpc-endpoint.joystream.org:9944'
const NR_DEFAULT_SMALL_ASSETS = 9
const NR_BIG_ASSETS = 1

async function main() {
  program
    .option('-w, --workers <workerId>', `the Worker id's to perform the tests, separated by comma. Ex: 4,5,6`)
    .option('-f, --asset-file [path]', 'a list of assets ids to download the same files for different providers')
    .option('-s, --nr-small-assets [number]', 'the number of small files to download', NR_DEFAULT_SMALL_ASSETS)
    .option('-b, --nr-big-assets [number]', 'the number of big files to download', NR_BIG_ASSETS)
    .parse()

  const provider = new WsProvider(process.env.PROVIDER_URL || PROVIDER_URL)
  const api = await ApiPromise.create({ provider, types })
  await api.isReady

  const args = program.opts()

  let dataObjectsIds = []
  const assetsFilePath = args.assetFile
  if (assetsFilePath) {
    try {
      await fsPromises.access(assetsFilePath, fs.constants.R_OK)
    } catch {
      console.error('Unable to read ' + assetsFilePath)
      process.exit(1)
    }

    const data = (await fsPromises.readFile(assetsFilePath, 'utf8')).toString()
    dataObjectsIds = data
      .split('\n')
      .filter((line) => line)
      .map((line) => ContentId.decode(api.registry, line))
  } else {
    dataObjectsIds = await generateListOfDataObjectsToDownload(api, args.nrSmallAssets, args.nrBigAssets)
    const writeStream = fs.createWriteStream(Path.join(__dirname, '..', 'assets.txt'))
    for (const id of dataObjectsIds) {
      writeStream.write(id.encode() + '\n')
    }
    writeStream.close()
  }

  const dataObjects = await Promise.all(
    dataObjectsIds.map(async (id) => {
      const dataObject = await api.query.dataDirectory.dataByContentId(id)
      dataObject.contentId = id
      return dataObject
    })
  )

  let workerIds = args.workers?.split(',')
  if (!workerIds) {
    workerIds = await getActiveWorkersIds(api)
  }

  let success = true
  try {
    for (const workerId of workerIds) {
      try {
        await testWorker(api, workerId, dataObjects)
      } catch (e) {
        console.error(e)
      }
      await clearFolder(TEMP_FOLDER)
    }
  } catch {
    success = false
  } finally {
    await api.disconnect()
  }

  if (!success) {
    process.exit(2)
  }
}

async function testWorker(api, workerId, dataObjects) {
  const endpoint = await getWorkerEndpoint(api, workerId)
  if (!endpoint) {
    throw new Error(`Worker ${workerId} doesn't have an endpoint defined`)
  }

  const promises = []
  const startRequests = process.hrtime.bigint()
  for (const dataObject of dataObjects) {
    const url = makeAssetUrl(dataObject.contentId, endpoint)
    promises.push(downloadFile(url, TEMP_FOLDER, dataObject.contentId.toString()))
  }
  try {
    const times = await Promise.all(promises)
    const endRequests = process.hrtime.bigint()
    const totalTime = Number((endRequests - startRequests) / BigInt(1000000))
    const totalSizeInMegas =
      dataObjects.reduce((accumulator, dataObject) => accumulator + Number(dataObject.size_in_bytes), 0) / 1024 / 1024

    const average = times.reduce((accumulator, time) => accumulator + time, 0) / times.length
    console.log(
      JSON.stringify({
        averageMs: average.toFixed(2),
        medianMs: computeMedian(times).toFixed(2),
        maxMs: Math.max.apply(Math, times).toFixed(2),
        minMs: Math.min.apply(Math, times).toFixed(2),
        totalTimeMs: totalTime,
        averageSpeedMBpS: (totalSizeInMegas / (totalTime / 100)).toFixed(3),
        nrFilesDownloaded: times.length,
        workerId: workerId,
      })
    )
  } catch (e) {
    throw new Error('Fail to download files from worker')
  }
}

main()
