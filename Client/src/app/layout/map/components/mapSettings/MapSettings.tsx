import "./style/mapSettings.css";
import { Save, Settings, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../../lib/hooks"
import { selectConfig, updateConfig } from "../../../../configSlice"
import { useCallback, useEffect, useRef, useState } from "react";
import { capitalizeFirstLetter, Logger } from "../../../../../lib/utils";
import { ConfigApi } from "../../../../../lib/api";
import type { Config } from "../../../../../lib/types";
import { selectUserState } from "../../../auth/authSlice";
import { selectIsSettingsWindowOpen, setIsSettingsWindowOpen, toggleSettingsWindow } from "../../mapSlice";

export default function MapSettings() {
    const config = useAppSelector(selectConfig);
    const isSettingsWindowOpen = useAppSelector(selectIsSettingsWindowOpen);
    const user = useAppSelector(selectUserState);
    const dispatch = useAppDispatch();

    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const windowRef = useRef<HTMLDivElement>(null);

    const categorizeColorSettings = useCallback(() => {
        const categories: Record<string, Array<[string, string]>> = {};

        Object.entries(config).forEach(([key, value]) => {
            if (!key.endsWith('_COLOR')) return;

            // Extract category from key prefix
            let category = 'Other';

            if (key.startsWith('OG_MUS_DIREK_')) {
                category = 'OG Mus Direk';
            } else if (key.startsWith('AG_DIREK_')) {
                category = 'AG Direk';
            } else if (key.startsWith('AYD_DIREK_')) {
                category = 'AYD Direk';
            } else if (key.startsWith('OG_HAT_')) {
                category = 'OG Hat';
            } else if (key.startsWith('AG_HAT_')) {
                category = 'AG Hat';
            } else if (key.startsWith('REKORTMAN_')) {
                category = 'Rekortman';
            } else if (key.startsWith('ADR_BINA_') || key.startsWith('TRAFO_')) {
                category = 'Bina';
            } else if (key.startsWith('ADR_YOL_')) {
                category = 'Yol';
            } else if (key === 'HOVER_COLOR') {
                category = 'Genel';
            }

            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push([key, value]);
        });

        return categories;
    }, [config]);

    const formatLabel = useCallback((key: string): string => {
        const formatted = key
            .replace(/_COLOR$/, '')
            .replaceAll(/_/, ' ')
            .toLowerCase()
            .split(' ')
            .map(capitalizeFirstLetter)
            .join(' ')
            .replace('demir', 'Demir')
            .replace('poligon', 'Poligon')
            .replace(/ag/i, "")
            .replace(/og/i, "")
            .replace(/mus/i, "")
            .replace(/direk/i, "")
            .replace(/ayd/i, "")
            .replace(/adr/i, "")
            .replace(/hat/i, "")
            .replace(/rekortman/i, "")
            .replace(/yol/i, "")

        const words = formatted.split(' ');
        return words.map(word => word.length > 2 ? word : word.toUpperCase()).join(' ');
    }, []);

    // Handle mouse down on header to start dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);

        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
            setDragStart({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }, []);

    // Handle mouse move for dragging
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Constrain to viewport
        const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDragging, dragStart]);

    // Handle mouse up to stop dragging
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Helper functions for color and alpha
    const getHexFromConfig = (value: string): string => {
        return value.length >= 7 ? value.slice(0, 7) : '#000000';
    };

    const getAlphaFromConfig = (value: string): number => {
        if (value.length === 9) {
            // Extract alpha from 8-character hex (#rrggbbaa)
            const alphaHex = value.slice(7, 9);
            return Number.parseInt(alphaHex, 16) / 255;
        }
        return 1; // Default to fully opaque
    };

    const createColorWithAlpha = (hex: string, alpha: number): string => {
        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
        return `${hex}${alphaHex}`;
    };

    const handleColorChange = useCallback((key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        const currentAlpha = getAlphaFromConfig(config[key] || '#000000ff');
        const newValue = createColorWithAlpha(newHex, currentAlpha);

        // Clear existing timeout for this key
        if (debounceTimeouts.current[key]) {
            clearTimeout(debounceTimeouts.current[key]);
        }

        // Set new timeout
        debounceTimeouts.current[key] = setTimeout(() => {
            dispatch(updateConfig({ [key]: newValue }));
            delete debounceTimeouts.current[key];
        }, 300); // 300ms delay
    }, [dispatch, config]);

    const handleAlphaChange = useCallback((key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const newAlpha = Number.parseFloat(e.target.value);
        const currentHex = getHexFromConfig(config[key] || '#000000');
        const newValue = createColorWithAlpha(currentHex, newAlpha);

        dispatch(updateConfig({ [key]: newValue }));
    }, [dispatch, config]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimeouts.current).forEach(clearTimeout);
        };
    }, []);

    const handleSaveConfig = async () => {
        for (const [key, value] of Object.entries(config)) {
            const configRow = {
                key: key,
                value: value
            } as Config
            try {
                await ConfigApi.updateConfig(configRow);
            } catch (error) {
                Logger.error("Error saving config:", error);
            }
        }
    }

    return (
        user && user.userRole === 'admin' && <>
            <div className="map-settings-toggle">
                <button
                    onClick={() => dispatch(toggleSettingsWindow())}
                    title="Open Map Settings"
                >
                    <Settings />
                </button>
            </div>
            {isSettingsWindowOpen && (
                <div
                    ref={windowRef}
                    className="map-settings-window"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        bottom: 'auto'
                    }}
                >
                    <div
                        className="window-header"
                        onMouseDown={handleMouseDown}
                    >
                        <h3>Map Settings</h3>
                        <button
                            onClick={() => dispatch(setIsSettingsWindowOpen(false))}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <X />
                        </button>
                    </div>
                    <div className="window-content">
                        <div className="color-settings">
                            {config && Object.entries(categorizeColorSettings()).map(([category, settings]) => (
                                <div key={category} className="settings-category">
                                    <h2>{category}</h2>
                                    <div>
                                        {settings.map(([key, setting]) => (
                                            <div className="setting-item" key={key}>
                                                <label htmlFor={key}>
                                                    {formatLabel(key)}
                                                </label>
                                                <div className="color-controls">
                                                    <input
                                                        type="color"
                                                        id={key}
                                                        name={key}
                                                        value={getHexFromConfig(setting)}
                                                        onChange={(e) => handleColorChange(key, e)}
                                                        className="color-picker"
                                                    />
                                                    <div className="alpha-control">
                                                        <label htmlFor={`${key}_alpha`} className="alpha-label">
                                                            α
                                                        </label>
                                                        <input
                                                            type="range"
                                                            id={`${key}_alpha`}
                                                            name={`${key}_alpha`}
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={getAlphaFromConfig(setting)}
                                                            onChange={(e) => handleAlphaChange(key, e)}
                                                            className="alpha-slider"
                                                        />
                                                        <span className="alpha-value">
                                                            {Math.round(getAlphaFromConfig(setting) * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="save-button" onClick={handleSaveConfig}>
                        <Save /> Save Settings
                    </button>
                </div>
            )}
        </>
    )
}