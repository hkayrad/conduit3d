import { DataType } from "../../../lib/enums";
import InfoField from "../infoField/InfoField";

export default function InfoContent(properties: any) {
    if (!properties) return null;

    switch (properties.dataType) {
        case DataType.BUILDING:
            return (
                <>
                    <InfoField
                        label="Name"
                        value={properties.name} capitalize={true}
                    />
                    <InfoField label="Height" value={`${properties.height} m`} />
                    <InfoField label="Floor Count" value={properties.floorCount} />
                    <InfoField label="Type" value={properties.type} capitalize={true} />
                </>
            );

        case DataType.TRAFO:
            return (
                <>
                    <InfoField
                        label="Name"
                        value={properties.name} capitalize={true}
                    />
                    <InfoField label="Code" value={properties.kodu} />
                </>
            );

        case DataType.POLE:
            return (
                <>
                    <InfoField label="Pole No" value={properties.direkNo} />
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Type" value={properties.tipi} />
                    <InfoField label="Height" value={`${properties.height} m`} />
                    <InfoField label="Pole Features" value={properties.boyOzellik} />
                </>
            );

        case DataType.LINE:
            return (
                <>
                    <InfoField label="Cinsi" value={properties.cinsi} />
                    <InfoField label="Type" value={properties.tipi} />
                    <InfoField label="Section" value={properties.kesit} />
                </>
            );

        case DataType.REKORTMAN:
            return (
                <>
                    <InfoField label="Cinsi" value={properties.tipi} />
                    <InfoField label="Section" value={properties.kesit} />
                </>
            );

        default:
            return null;
    }
}