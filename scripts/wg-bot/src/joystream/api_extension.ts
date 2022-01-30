import { ApplicationOf, OpeningOf } from "@joystream/types/augment-codec/all";
import { Application, ApplicationId, Opening, OpeningId } from "@joystream/types/hiring";
import { ApiPromise } from "@polkadot/api";
import { Hash } from "@polkadot/types/interfaces";

export const getOpening = async (api: ApiPromise, group: string, hash: Hash, openingId: OpeningId): Promise<OpeningOf> => {
    return api.query[group].openingById.at(hash, openingId)
}

export const getHiringOpening = async (api: ApiPromise, hash: Hash, openingId: OpeningId): Promise<Opening> => {
    return (await api.query.hiring.openingById.at(hash, openingId))
}

export const getApplication = async (api: ApiPromise, group: string, hash: Hash, applicationId: ApplicationId): Promise<ApplicationOf> => {
    return api.query[group].applicationById.at(hash, applicationId)
}

export const getHiringApplication = async (api: ApiPromise, group: string, hash: Hash, applicationId: ApplicationId): Promise<Application> => {
    return api.query.hiring.applicationById.at(hash, applicationId)
}
