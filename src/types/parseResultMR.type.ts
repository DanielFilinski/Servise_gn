import { TLink } from "./parseResult.type"


export type TParseResultMR = {
    id: number
    date: string,
    title: string,
    content: TContentMR[]
}

export type TContentMR = {
    id: number
    type: TContentTypeMR,
    text: string,
    links?: TLink[]
}

type TContentTypeMR =
    | "memoryVerse"
    | "meinText"
    | "prayTitle"
    | string

export type TOldContentMR = {
    [key in string]: TOldItemMR
}

export type TOldItemMR = {
    "date": string,
    "lessonName": string,
    "memoryVerse": string,
    "meinText": string,
    "prayTitle": string,
    "prayText": string
}