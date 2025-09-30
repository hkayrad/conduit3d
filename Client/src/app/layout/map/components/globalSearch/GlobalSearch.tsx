import { Building, PlugZap, Search, UtilityPole } from "lucide-react";
import "./style/globalSearch.css";
import { useEffect } from "react";
import { useSearch } from "../../../../../lib/hooks/useSearch";
import { FeatureType } from "../../../../../lib/enums";

const ICONS: Record<FeatureType, React.ReactNode> = {
    [FeatureType.BUILDING]: <Building />,
    [FeatureType.TRAFO]: <Building />,
    [FeatureType.POLE]: <UtilityPole />,
    [FeatureType.LINE]: <PlugZap />,
    [FeatureType.REKORTMAN]: <PlugZap />
}

type Props = {
    flyTo: (feature: GeoJSON.Feature) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
}

export default function GlobalSearch(props: Props) {
    const { flyTo, searchInputRef } = props;

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
                <div className="hint">Keywords: bina, trafo, direk, agdirek, ogmusdirek, ayddirek, hat, aghat, oghat, rekortman</div>
            </div>
            <div id="global-search" className={results.length > 0 && isFocused ? "with-results" : ""}>
                <div className="search-bar">
                    <Search />
                    <input
                        type="input"
                        ref={searchInputRef}
                        placeholder="Search for a feature"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click event on results
                    />
                </div>
                {results.length > 0 && isFocused && (
                    <div className="results">
                        {results.map(result => (
                            <div key={result.id} className="result-item" onClick={() => handleGoTo(result.feature)}>
                                <div className="icon">{ICONS[result.type]}</div>
                                <div className="text">
                                    <div className="title">{result.title}</div>
                                    <div className="subtitle">{result.subtitle}</div>
                                </div>
                                <div className="position">
                                    {result.position[0]}, {result.position[1]}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}