import type UserData from './userInterface';

export interface PostData {
    _id : string
    title : string
    summary : string
    description : unknown
    caption?: string
    topics : string[]
    author : UserData
    likesCount : number
    commentsCount?: number
    viewsCount?: number
}