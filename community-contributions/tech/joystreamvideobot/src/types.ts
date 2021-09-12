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
    thumbnailPhotoDataObject: IThumb,
    channel: IChannel,
    category: ICategory,
    language: ILanguage,
    license: ILicense,
    mediaDataObject: IMediaDataObject,
    createdAt: string
}

export interface IMediaDataObject {
    size: number
}

export interface ILicense {
    code: string
}

export interface IThumb {
    liaison: ILiaison,
    joystreamContentId: string
}

export interface ILiaison {
    metadata: string
}

export interface IChannel {
    title: string,
    id: string,
    ownerMember: IOwnerMember,
    avatarPhotoDataObject: IThumb,
    createdById: string;
}

export interface IOwnerMember {
    rootAccount: string;
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