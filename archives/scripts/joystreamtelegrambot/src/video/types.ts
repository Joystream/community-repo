export interface IVideoResponse {
    data: IData
}

export interface IData {
    videosConnection: IVideoConnection
}

export interface IVideoConnection {
    edges: IVideo[]
}

export interface IVideo {
    node: INode
}

export interface INode {
    title: string,
    description: string,
    duration: number,
    id: string,
    thumbnailPhoto: IThumb,
    channel: IChannel,
    category: ICategory,
    language: ILanguage,
    license: ILicense,
    media: IMediaDataObject,
    createdAt: string
}

export interface IMediaDataObject {
    size: number
}

export interface ILicense {
    code: string
}

export interface IThumb {
    id: number
    storageBag: IStorageBag
}

export interface IStorageBag {
    id: number
    distributionBuckets: IDistributionBucket[]
}

export interface IDistributionBucket {
    id: number
    operators: IOperator[]
}

export interface IOperator {
    metadata: IMetadata
}

export interface IMetadata {
    nodeEndpoint: string
}

export interface ILiaison {
    metadata: string
}

export interface IChannel {
    title: string,
    id: string,
    ownerMember: IOwnerMember,
    avatarPhoto: IThumb,
    createdById: string;
}

export interface IOwnerMember {
    controllerAccount: string;
}

export interface ICategory {
    name: string;
}

export interface ILanguage {
    iso: string;
}

export interface LooseObject {
    [key: string]: any
}
