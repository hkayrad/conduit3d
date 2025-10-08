import { FeatureType } from "../../../lib/enums";
import InfoField from "../infoField/InfoField";

/**
 * InfoContent component displays information fields based on the properties provided.
 * @component
 * @param properties - The properties for the component
 * @param coordinate - Optional coordinates to display
 * @returns The rendered component
 */
export default function InfoContent(properties: any, coordinate?: number[]): React.ReactNode | null {
    if (!properties) return null;

    switch (properties.dataType) {
        case FeatureType.BUILDING:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField
                        label="Adi"
                        value={properties.adi} capitalize={true}
                    />
                    <InfoField label="Site Adi" value={properties.siteAdi} />
                    <InfoField label="Kodu" value={properties.kodu} />
                    <InfoField label="Bina Kat Sayisi" value={properties.binaKatSayisi} />
                    <InfoField label="Daire Sayisi" value={properties.daireSayisi} />
                    <InfoField label="Isyeri Sayisi" value={properties.isyeriSayisi} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.TRAFO:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField
                        label="Adi"
                        value={properties.adi} capitalize={true}
                    />
                    <InfoField label="Kodu" value={properties.kodu} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.YOL:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField label="Adi" value={properties.adi} />
                    <InfoField label="Kodu" value={properties.kodu} />
                    <InfoField label="Tipi" value={properties.tipi} />
                    <InfoField label="Yapisi" value={properties.yapisi} />
                    <InfoField label="Serit Sayisi" value={properties.seritSayisi} />
                    <InfoField label="Genislik" value={properties.genislik} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            )

        case FeatureType.POLE:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField label="Adi" value={properties.adi} />
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Tipi" value={properties.tipi} />
                    <InfoField label="Direk No" value={properties.direkNo} />
                    <InfoField label="Boy Ozellik" value={properties.boyOzellik} />
                    <InfoField label="Direk Boy Id" value={properties.direkBoyId} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.LINE:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField label="Adi" value={properties.adi} />
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Tipi" value={properties.tipi} />
                    <InfoField label="Kesit" value={properties.kesit} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.REKORTMAN:
            return (
                <>
                    <InfoField label="Id" value={properties.id} />
                    <InfoField label="Tipi" value={properties.tipi} />
                    <InfoField label="Kesit" value={properties.kesit} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`} />
                        )
                    }
                </>
            );

        default:
            return null;
    }
}