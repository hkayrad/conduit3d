import type { FirstPersonViewState, MapViewState } from "deck.gl"
import type { C3D_MapViewType, HatCinsi } from "./enums"

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

export type UserCounts = {
    totalUsers: number,
    activeUsers: number,
    inactiveUsers: number
}

export type AdminModalStatus = {
    isEditModalOpen: boolean,
    isAddModalOpen: boolean,
    isDeleteModalOpen: boolean
}

export type TableData = {
    headers: { id: string, label: string }[],
    rows: (string | React.ReactNode)[][];
}

export type UserSortBy = 'id' | 'username' | 'email' | 'userRole' | 'name' | 'createdAt' | 'isActive';

export type AdrBina = {
    id: number,
    adi: string,
    siteAdi: string,
    kodu: string,
    binaKatSayisi: number,
    daireSayisi: number,
    isyeriSayisi: number,
    yukseklik: number,
    geoJson: string
}

export type TrafoBina = {
    id: number,
    adi: string,
    kodu: string,
    geoJson: string
}

export type Hat = {
    id: number,
    kodu: string,
    adi: string,
    cinsi: HatCinsi,
    kesit: string,
    tipi: string,
    geoJson: string
}

export type Rekortman = {
    id: number,
    kodu: string,
    adi: string,
    kesit: string,
    tipi: string,
    geoJson: string
}

export type Direk = {
    id: number,
    kodu: string,
    adi: string,
    cinsi: string,
    tipi: string,
    direkNo: string,
    boyOzellik: string,
    direkBoyId: number,
    geoJson: string
}

export type PopupState = {
    id: string;
    info: PickingInfo;
    zIndex: number;
}

export type C3D_ViewState = {
    [C3D_MapViewType.Cartesian]: MapViewState,
    [C3D_MapViewType.FirstPerson]: FirstPersonViewState
}