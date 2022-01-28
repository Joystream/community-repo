import { IOpening } from "@joystream/types/hiring";
import { ApiPromise } from "@polkadot/api";
import { Hash } from "@polkadot/types/interfaces";

export const getOpening = async (api: ApiPromise, hash: Hash, openingId: number): Promise<IOpening> => {
    return api.query.hiring.openingById.at(hash, openingId)
}