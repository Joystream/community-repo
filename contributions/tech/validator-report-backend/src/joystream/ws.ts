// TODO allow alternative backends

import { ApiPromise, WsProvider } from '@polkadot/api'
import { types } from '@joystream/types'

const wsLocation =
    process.env.RPC_ENDPOINT || 'ws://localhost:9944'
    // 'wss://rome-rpc-endpoint.joystream.org:9944'

export const connectUpstream = async (): Promise<ApiPromise> => {
    try {
        //console.debug(`[Joystream] Connecting to ${wsLocation}`)
        const provider = new WsProvider(wsLocation)
        const api = await ApiPromise.create({ provider, types })
        await api.isReady
        console.debug(`[Joystream] Connected to ${wsLocation}`)
        return api
    } catch (e) {
        console.error(`[Joystream] upstream connection failed`, e)
        throw new Error()
    }
}

module.exports = { connectUpstream }
