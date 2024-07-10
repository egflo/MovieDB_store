export enum SortBy {
    ID = "id",
    CREATED = "created",


}

export enum Direction {
    ASC = 1,
    DESC = 0
}

export interface Sort {
    sortBy: SortBy,
    direction: Direction
}
