import { useState, useEffect } from "react";
import Modal from "../../../../../shared/modal/Modal";
import "./style/saveFeatureModal.scss";

type GeometryType = "Point" | "LineString" | "Polygon" | "None";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (featureType: string, attributes: Record<string, any>) => void;
    geometryType: GeometryType;
};

const FEATURE_TYPES: Record<string, string[]> = {
    Point: ["AgDirek", "OgMusDirek", "AydDirek", "TrafoBina"],
    LineString: ["AgHat", "OgHat", "Rekortman", "AdrYol"],
    Polygon: ["AdrBina"],
};

type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "number";
};

const FIELD_SCHEMAS: Record<string, FieldConfig[]> = {
    AgDirek: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "cinsi_val", label: "Cinsi", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
        { name: "direk_no_val", label: "Direk No", type: "text" },
        { name: "boy_ozellik_val", label: "Boy Özellik", type: "text" },
        { name: "direk_boy_id_val", label: "Direk Boy ID", type: "number" },
    ],
    OgMusDirek: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "cinsi_val", label: "Cinsi", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
        { name: "direk_no_val", label: "Direk No", type: "text" },
        { name: "boy_ozellik_val", label: "Boy Özellik", type: "text" },
        { name: "direk_boy_id_val", label: "Direk Boy ID", type: "number" },
    ],
    AydDirek: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "cinsi_val", label: "Cinsi", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
        { name: "direk_no_val", label: "Direk No", type: "text" },
        { name: "boy_ozellik_val", label: "Boy Özellik", type: "text" },
        { name: "direk_boy_id_val", label: "Direk Boy ID", type: "number" },
    ],
    TrafoBina: [
        // Assuming generic fields or none specified, keeping empty for now or adding generic
        { name: "adi_val", label: "Adı", type: "text" },
    ],
    AgHat: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "cinsi_val", label: "Cinsi", type: "text" },
        { name: "kesit_val", label: "Kesit", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
    ],
    OgHat: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "cinsi_val", label: "Cinsi", type: "text" },
        { name: "kesit_val", label: "Kesit", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
    ],
    Rekortman: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "kesit_val", label: "Kesit", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
    ],
    AdrYol: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "genislik_val", label: "Genişlik", type: "number" },
        { name: "serit_sayisi_val", label: "Şerit Sayısı", type: "number" },
        { name: "yapisi_val", label: "Yapısı", type: "text" },
        { name: "tipi_val", label: "Tipi", type: "text" },
    ],
    AdrBina: [
        { name: "kodu_val", label: "Kodu", type: "text" },
        { name: "site_adi_val", label: "Site Adı", type: "text" },
        { name: "adi_val", label: "Adı", type: "text" },
        { name: "bina_kat_sayisi_val", label: "Kat Sayısı", type: "number" },
        { name: "daire_sayisi_val", label: "Daire Sayısı", type: "number" },
        { name: "isyeri_sayisi_val", label: "İşyeri Sayısı", type: "number" },
        { name: "yukseklik_val", label: "Yükseklik", type: "number" },
    ],
};

export default function SaveFeatureModal({
    isOpen,
    onClose,
    onSave,
    geometryType,
}: Props) {
    const [selectedType, setSelectedType] = useState<string>("");
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isOpen && geometryType !== "None") {
            const types = FEATURE_TYPES[geometryType];
            if (types && types.length > 0) {
                setSelectedType(types[0]);
            }
            setFormValues({});
        }
    }, [isOpen, geometryType]);

    const handleInputChange = (name: string, value: string | number) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!isOpen) return null;

    const availableTypes = FEATURE_TYPES[geometryType] || [];
    const currentFields = FIELD_SCHEMAS[selectedType] || [];

    return (
        <Modal className="save-feature-modal-container">
            <div className="save-feature-modal">
                <h3>Save Feature</h3>
                <div className="form-group">
                    <label>Feature Type:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setFormValues({});
                        }}
                    >
                        {availableTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {currentFields.map((field) => (
                    <div className="form-group" key={field.name}>
                        <label>{field.label}:</label>
                        <input
                            type={field.type}
                            value={formValues[field.name] || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    field.name,
                                    field.type === "number"
                                        ? parseFloat(e.target.value)
                                        : e.target.value,
                                )
                            }
                        />
                    </div>
                ))}

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="save-btn"
                        onClick={() => onSave(selectedType, formValues)}
                        disabled={!selectedType}
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
}
