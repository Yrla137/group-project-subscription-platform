import "./Spinner.css";

const Spinner = () => {
    return (
        <div className="spinner-container" role="status" aria-label="Loading">
            <div className="spinner-orbit">
                <span className="spinner-dot spinner-dot-one"></span>
                <span className="spinner-dot spinner-dot-two"></span>
                <span className="spinner-dot spinner-dot-three"></span>
                <span className="spinner-dot spinner-dot-four"></span>
                <span className="spinner-dot spinner-dot-five"></span>
                <span className="spinner-dot spinner-dot-six"></span>
            </div>

            <p className="spinner-text">Loading...</p>
        </div>
    );
};

export default Spinner;


