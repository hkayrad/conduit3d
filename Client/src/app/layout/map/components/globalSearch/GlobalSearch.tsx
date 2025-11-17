import { Building, PlugZap, Search, UtilityPole, Waypoints } from "lucide-react";
import "./style/globalSearch.css";
import { useEffect, useRef } from "react";
import { useSearch } from "../../../../../lib/hooks/useSearch";
import { FeatureType } from "../../../../../lib/enums";

const ICONS: Record<FeatureType, React.ReactNode> = {
    [FeatureType.BUILDING]: <Building />,
    [FeatureType.TRAFO]: <Building />,
    [FeatureType.POLE]: <UtilityPole />,
    [FeatureType.LINE]: <PlugZap />,
    [FeatureType.REKORTMAN]: <PlugZap />,
    [FeatureType.YOL]: <Waypoints />
}

type Props = {
    flyTo: (feature: GeoJSON.Feature) => void;
    searchInputRef: React.Ref<HTMLInputElement>;
}

export default function GlobalSearch(props: Readonly<Props>) {
    const { flyTo, searchInputRef } = props;

    const searchContainerRef = useRef<HTMLDivElement>(null);
    // Custom hook to handle search logic
    const { query, setQuery, results, handleSearch, isFocused, setIsFocused } = useSearch();

    // Handlers
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleGoTo = (feature: GeoJSON.Feature) => {
        setIsFocused(false);
        setQuery("");
        flyTo(feature)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, feature: GeoJSON.Feature) => {
        if (e.key === 'Enter') {
            handleGoTo(feature);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
        }
    };

    // Effects
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => { clearTimeout(timeoutId); }
    }, [query]);

    return (
        <>
            <div className={`info-card ${isFocused ? "" : "hidden"}`}>
                <div className="shortcut">Press <kbd>Ctrl</kbd> <kbd>/</kbd> to focus the search bar</div>
                <div className="shortcut">Press <kbd>Esc</kbd> to unfocus the search</div>
                <div className="hint">Keywords: bina, trafo, yol, direk, agdirek, ogmusdirek, ayddirek, hat, aghat, oghat, rekortman</div>
            </div>
            <div
                id="global-search"
                ref={searchContainerRef}
                className={results.length > 0 && isFocused ? "with-results" : ""}
                onBlur={handleBlur}
            >
                <div className="search-bar">
                    <Search />
                    <input
                        type="input"
                        ref={searchInputRef}
                        placeholder="Search for a feature"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => setIsFocused(true)}
                    />
                </div>
                {results.length > 0 && isFocused && (
                    <div className="results">
                        {results.map((result) => (
                            <button
                                key={result.id}
                                className="result-item"
                                onClick={() => handleGoTo(result.feature)}
                                onKeyDown={(e) => handleKeyDown(e, result.feature)}
                                tabIndex={0}
                            >
                                <div className="icon">{ICONS[result.type]}</div>
                                <div className="text">
                                    <div className="title" title={result.title}>{result.title}</div>
                                    <div className="subtitle" title={result.subtitle}>{result.subtitle}</div>
                                </div>
                                <div className="position" title={`Position: ${result.position[0]}, ${result.position[1]}`}>
                                    {result.position[0]}, {result.position[1]}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
