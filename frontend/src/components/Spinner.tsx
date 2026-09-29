import "./Spinner.css";

const Spinner = () => {
  return (
      <div className="loading-spinner" role="status">
          <span className="spinner-span" aria-hidden="true" />
          <span className="visually-hidden">Loading...</span>
      </div>
  )
}

export default Spinner
