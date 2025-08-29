export const renderField = (label: string, value: string | number | undefined, capitalize = false) => {
    if (!value) return null;
    return (
        <p key={label} >
            {label}: <span className={capitalize ? "capitalize" : ""}> {value} </span>
        </p>
    );
};