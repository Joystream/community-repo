import { OpeningOf } from "@joystream/types/augment-codec/all";
import { Opening, OpeningId } from "@joystream/types/hiring";
import { ApiPromise } from "@polkadot/api";
import { Hash } from "@polkadot/types/interfaces";

export const getOpening = async (api: ApiPromise, group: string, hash: Hash, openingId: number): Promise<OpeningOf> => {
    return api.query[group].openingById.at(hash, openingId)
}

export const getHiringOpening = async (api: ApiPromise, hash: Hash, openingId: OpeningId): Promise<Opening> => {
    return (await api.query.hiring.openingById.at(hash, openingId))
}