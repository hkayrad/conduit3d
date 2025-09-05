import './style/modal.css';

type Props = {
    children: React.ReactNode
}

export default function Modal(props: Props) {
    const { children } = props;
    return (
        <div className="modal-overlay">
            <div className="modal">
                {children}
            </div>
        </div>
    )
}