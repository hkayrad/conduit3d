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
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "cinsi", label: "Cinsi", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
    { name: "direk_no", label: "Direk No", type: "text" },
    { name: "boy_ozellik", label: "Boy Özellik", type: "text" },
    { name: "direk_boy_id", label: "Direk Boy ID", type: "number" },
  ],
  OgMusDirek: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "cinsi", label: "Cinsi", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
    { name: "direk_no", label: "Direk No", type: "text" },
    { name: "boy_ozellik", label: "Boy Özellik", type: "text" },
    { name: "direk_boy_id", label: "Direk Boy ID", type: "number" },
  ],
  AydDirek: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "cinsi", label: "Cinsi", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
    { name: "direk_no", label: "Direk No", type: "text" },
    { name: "boy_ozellik", label: "Boy Özellik", type: "text" },
    { name: "direk_boy_id", label: "Direk Boy ID", type: "number" },
  ],
  TrafoBina: [
    // Assuming generic fields or none specified, keeping empty for now or adding generic
    { name: "adi", label: "Adı", type: "text" },
    { name: "kodu", label: "Kodu", type: "text" },
  ],
  AgHat: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "cinsi", label: "Cinsi", type: "text" },
    { name: "kesit", label: "Kesit", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
  ],
  OgHat: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "cinsi", label: "Cinsi", type: "text" },
    { name: "kesit", label: "Kesit", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
  ],
  Rekortman: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "kesit", label: "Kesit", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
  ],
  AdrYol: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "genislik", label: "Genişlik", type: "number" },
    { name: "serit_sayisi", label: "Şerit Sayısı", type: "number" },
    { name: "yapisi", label: "Yapısı", type: "text" },
    { name: "tipi", label: "Tipi", type: "text" },
  ],
  AdrBina: [
    { name: "kodu", label: "Kodu", type: "text" },
    { name: "site_adi", label: "Site Adı", type: "text" },
    { name: "adi", label: "Adı", type: "text" },
    { name: "bina_kat_sayisi", label: "Kat Sayısı", type: "number" },
    { name: "daire_sayisi", label: "Daire Sayısı", type: "number" },
    { name: "isyeri_sayisi", label: "İşyeri Sayısı", type: "number" },
    { name: "yukseklik", label: "Yükseklik", type: "number" },
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
        const initialType = types[0];
        setSelectedType(initialType);

        const defaults: Record<string, any> = {};
        const fields = FIELD_SCHEMAS[initialType] || [];
        fields.forEach((field) => {
          if (field.type === "number") {
            defaults[field.name] = 0;
          } else {
            defaults[field.name] = "";
          }
        });
        setFormValues(defaults);
      } else {
        setFormValues({});
      }
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
              const newType = e.target.value;
              setSelectedType(newType);

              const defaults: Record<string, any> = {};
              const fields = FIELD_SCHEMAS[newType] || [];
              fields.forEach((field) => {
                if (field.type === "number") {
                  defaults[field.name] = 0;
                } else {
                  defaults[field.name] = "";
                }
              });
              setFormValues(defaults);
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
              value={
                formValues[field.name] !== undefined
                  ? formValues[field.name]
                  : ""
              }
              onChange={(e) => handleInputChange(field.name, e.target.value)}
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
