import type { HatCinsi } from "./enums"

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
    password: string | null,
    userRole: string,
    name: string,
    createdAt: Date,
    isActive: boolean
}

export type LoginUserDto = {
    username: string,
    password: string
}

export type UserCountsDto = {
    totalUsers: number,
    activeUsers: number,
    inactiveUsers: number
}

export type TableData = {
    headers: { id: string, label: string }[],
    rows: (string | React.ReactNode)[][];
}

export type UserSortBy = 'id' | 'username' | 'email' | 'userRole' | 'name' | 'createdAt' | 'isActive';

export type AdrBina = {
    id: number,
    name: string | null,
    type: string | null,
    floorCount: number,
    geoJson: string
}

export type TrafoBina = {
    id: number,
    name: string | null,
    kodu: string | null,
    geoJson: string
}

export type Hat = {
    id: number,
    cinsi: HatCinsi,
    tipi: string,
    kesit: string,
    geoJson: string
}

export type Rekortman = {
    id: number,
    tipi: HatCinsi,
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

export type PopupState = {
    id: string;
    info: PickingInfo;
    zIndex: number;
}