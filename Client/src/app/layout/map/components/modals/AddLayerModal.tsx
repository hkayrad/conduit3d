import React, { useState } from "react";
import { useAppDispatch } from "../../../../../lib/hooks";
import { addCustomLayer } from "../../mapSlice";
import "./style/addLayerModal.scss";

interface AddLayerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddLayerModal({ isOpen, onClose }: AddLayerModalProps) {
    const dispatch = useAppDispatch();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [attribution, setAttribution] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && url) {
            dispatch(
                addCustomLayer({
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    url,
                    attribution,
                    visible: true,
                    opacity: 1,
                })
            );
            onClose();
            setName("");
            setUrl("");
            setAttribution("");
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="add-layer-modal" onKeyDown={(e) => e.stopPropagation()}>
                <h2>Add Custom Layer</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="layer-name">Name</label>
                        <input
                            id="layer-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. OpenTopoMap"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="layer-url">URL Template</label>
                        <input
                            id="layer-url"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            required
                        />
                        <div className="help-text">
                            Supports &#123;z&#125;, &#123;x&#125;, &#123;y&#125; placeholders.
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="layer-attribution">Attribution (Optional)</label>
                        <input
                            id="layer-attribution"
                            type="text"
                            value={attribution}
                            onChange={(e) => setAttribution(e.target.value)}
                            placeholder="e.g. © OpenStreetMap contributors"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="add-btn" disabled={!name || !url}>
                            Add Layer
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
