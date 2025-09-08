import { Circle, CircleCheck } from "lucide-react";
import type { MapState } from "../../../layout/map/mapSlice";
import "./style/layerControlFilter.css"

type Props = {
    label: string,
    typeList: string[],
    filters: string[],
    filterKey: keyof MapState["filters"],
    setFilters: (filters: string[], filterKey: keyof MapState["filters"]) => void
}

/**
 * LayerControlFilter component displays a filter control for map layers.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function LayerControlFilter(props: Props): React.ReactNode {
    const { label, typeList, filters, filterKey, setFilters } = props;

    return (
        <div className="layer-control-filter">
            <h4>{label}</h4>
            <div className="control-buttons">
                {typeList.map((type) => (
                    <button
                        key={type}
                        className={`filter-button ${filters.includes(type) || filters.length === 0 ? 'active' : ''}`}
                        onClick={() =>
                            setFilters(
                                filters.includes(type) ?
                                    filters.filter(f => f !== type) :
                                    [...filters, type],
                                filterKey
                            )
                        }
                    >
                        {filters.includes(type) ? <CircleCheck /> : <Circle />}
                        <p>{type}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}