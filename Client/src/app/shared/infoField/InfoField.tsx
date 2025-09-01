export default function InfoField({ label, value, capitalize = false }: { label: string; value: string | number | undefined; capitalize?: boolean }) {
    if (!value) return null;
    return (
        <p key={label} >
            {label}: <span className={capitalize ? "capitalize" : ""}> {value} </span>
        </p>
    );
}