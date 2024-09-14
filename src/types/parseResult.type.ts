export type TParseResult = {
    id: number
    date: string,  
    lessonNumber: number,
    lessonName: string,
    content: []  
}

export type TContent = {
    type: TContentType,
    text: string,
    link?: TLink[]
}

export type TContentType = 
    | "question" 

export type TLink = {
    bookNumber: number,
    chapter: number[],
    verses: number[]
}    