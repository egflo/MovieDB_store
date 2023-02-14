export enum SortBy {
    RATING = "ratings.numOfVotes",
    RELEASE_DATE = "releaseDate",
    TITLE = "title",
    YEAR = "year",
    ID = "id",
    POPULARITY = "popularity"
}

export enum Direction {
    ASC = 1,
    DESC = 0
}

export interface Sort {
    sortBy: SortBy,
    direction: Direction
}
