import { useNavigate } from "react-router";
import "./notFound.scss";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist or has been moved.</p>
                <button onClick={() => navigate("/")} className="home-button">
                    Return to Home
                </button>
            </div>
        </div>
    );
}