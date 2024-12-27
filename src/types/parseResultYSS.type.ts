

export type TParseResult = {
    id: number
    date: string,
    isFirstLesson?: boolean,
    lessonNumber: number,
    name: string,
    content: TContent[]
}

export type TContent = {
    id: number
    type: TContentType,
    text: string,
    links?: TLink[]
}

export type TContentType =
    | "question"
    | string

export type TLink = {
    text: string,
    data: {
        bookNumber: number | null,
        chapter: number[] | null,
        verses: number[] | null
    }[]
}


export type TOldParseResult = {
    [key: number]: {
        [key: string]: {
            "dateStart": string,
            "dateEnd": string,
            "lessonName": string,
            "lessonNumber": number,
            "isFirstLesson": true,
            "arrEl": TOldContent[]
        }
    }
}

export type TOldParse = {
    [key: string]: {
        "dateStart": string,
        "dateEnd": string,
        "lessonNumber": number,
        "lessonName": string,
        "isFirstLesson": true,
        "arrEl": TOldContent[]
    }
}
export type TOldContent = {
    "style": string,
    "text": {
        "isLink": boolean,
        "text": string
    }[]
}


export type TOldLink = {
    bookName: string;
    chapter: number[];
    verses: string;
}

export type TOldLinkArr = [string, ...TOldLink[]];