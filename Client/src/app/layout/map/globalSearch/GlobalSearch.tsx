import { Building, PlugZap, Search, UtilityPole } from "lucide-react";
import "./style/globalSearch.css";
import { useEffect, useState } from "react";
import { useSearch } from "../../../../lib/hooks/useSearch";
import { FeatureType } from "../../../../lib/enums";

const ICONS: Record<FeatureType, React.ReactNode> = {
    [FeatureType.BUILDING]: <Building />,
    [FeatureType.TRAFO]: <Building />,
    [FeatureType.POLE]: <UtilityPole />,
    [FeatureType.LINE]: <PlugZap />,
    [FeatureType.REKORTMAN]: <PlugZap />
}

type Props = {
    flyTo: (feature: GeoJSON.Feature) => void;
}

export default function GlobalSearch(props: Props) {
    const { flyTo } = props;

    // Local state
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Custom hook to handle search logic
    const { results, handleSearch } = useSearch(query, 10);

    // Handlers
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
    }

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
        <div id="global-search" className={results.length > 0 && isFocused ? "with-results" : ""}>
            <div className="search-bar">
                <Search />
                <input type="text"
                    placeholder="Search for a feature"
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={handleFocus}
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
    );
}