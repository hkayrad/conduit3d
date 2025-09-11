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
                    <InfoField
                        label="Adi"
                        value={properties.adi} capitalize={true}
                    />
                    <InfoField label="Site Adi" value={properties.siteAdi} />
                    <InfoField label="Kodu" value={properties.kodu} />
                    <InfoField label="Bina Kat Sayisi" value={properties.binaKatSayisi} />
                    <InfoField label="Daire Sayisi" value={properties.daireSayisi} />
                    <InfoField label="Isyeri Sayisi" value={properties.isyeriSayisi} />
                    <InfoField label="Yukseklik" value={`${properties.yukseklik} m`} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.TRAFO:
            return (
                <>
                    <InfoField
                        label="Adi"
                        value={properties.adi} capitalize={true}
                    />
                    <InfoField label="Kodu" value={properties.kodu} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.POLE:
            return (
                <>
                    <InfoField label="Pole No" value={properties.direkNo} />
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Type" value={properties.tipi} />
                    <InfoField label="Height" value={`${properties.height} m`} />
                    <InfoField label="Pole Features" value={properties.boyOzellik} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.LINE:
            return (
                <>
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Type" value={properties.tipi} />
                    <InfoField label="Section" value={properties.kesit} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`} />
                        )
                    }
                </>
            );

        case FeatureType.REKORTMAN:
            return (
                <>
                    <InfoField label="Cinsi" value={properties.tipi} />
                    <InfoField label="Section" value={properties.kesit} />
                    {
                        coordinate && (
                            <InfoField label="Position" value={`${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`} />
                        )
                    }
                </>
            );

        default:
            return null;
    }
}