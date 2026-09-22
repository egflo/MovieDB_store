export interface Cast {
    id: string,
    name: string,
    // Null in some records (e.g. Joaquin Phoenix in Earthlings).
    category: string | null,
    characters: string[],
    photo: string,
}