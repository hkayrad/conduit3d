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

export type Config = {
    [key: string]: string
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
    wkb: string
    // geoJson: string
}

export type Building = AdrBina;

export type TrafoBina = {
    id: number,
    adi: string,
    kodu: string,
    // geoJson: string,
    wkb: string
}

export type AdrYol = {
    id: number,
    genislik: number,
    seritSayisi: number,
    yapisi: string,
    tipi: string,
    kodu: string,
    adi: string,
    wkb: string
}

export type Hat = {
    id: number,
    kodu: string,
    adi: string,
    cinsi: HatCinsi,
    kesit: string,
    tipi: string,
    wkb: any
    // geoJson: string
}

export type Rekortman = {
    id: number,
    kodu: string,
    adi: string,
    kesit: string,
    tipi: string,
    wkb: any
    // geoJson: string
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
    wkb: any
    // geoJson: string
}

export type Armatur = {
    id: number,
    kodu: string,
    adi: string,
    marka: string,
    model: string,
    guc: string,
    bagli_tablo_kayit_id: number,
    wkb: any
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

export type C3D_LayerViewState = {
    [key in C3D_MapLayers]: boolean
}
