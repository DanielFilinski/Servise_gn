import { TLink } from "./parseResult.type"


export type TParseResultER = {
    id: number
    date: string,
    name: string,
    content: TContentER[]
}

export type TContentER = {
    id: number
    type: TContentTypeER,
    text: string,
    links?: TLink[]
}

type TContentTypeER =
    | "memoryVerse"
    | "meinText"
    | string

export type TOldContentER = {
    [key in string]: TOldItemER
}

export type TOldItemER = {
    "date": string,
    "lessonName": string,
    "memoryVerse": string,
    "meinText": string,
    "prayTitle": string,
    "prayText": string
}