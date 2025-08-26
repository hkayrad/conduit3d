export type ApiResponse<T> = {
    isSuccess: boolean,
    message: string,
    statusCode: number,
    data: T
}

export type Extent = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
}

export type User = {
    id: number,
    username: string,
    email: string,
    userRole: string,
    name: string,
    createdAt: Date,
}

export type LoginUserDto = {
    username: string,
    password: string
}

export type AdrBina = {
    id: number,
    name: string | null,
    type: string | null,
    floorCount: number,
    geoJson: string
}

export type Trafo = {
    id: number,
    name: string | null,
    kodu: string | null,
    geoJson: string
}

export type Hat = {
    id: number,
    cinsi: string,
    tipi: string,
    kesit: string,
    geoJson: string
}

export type Rekortman = {
    id: number,
    tipi: string,
    kesit: string,
    geoJson: string
}

export type Direk = {
    id: number,
    cinsi: string,
    tipi: string,
    boyOzellik: string,
    direkNo: string,
    geoJson: string
}