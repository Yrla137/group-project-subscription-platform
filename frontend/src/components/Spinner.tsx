import "./Spinner.css";

const Spinner = () => {
  return (
      <div className="calendar-loading" role="status">
          <span className="calendar-spinner" aria-hidden="true" />
          <span className="visually-hidden">Loading calendar</span>
      </div>
  )
}

export default Spinner
