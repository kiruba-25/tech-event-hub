import { Link } from "react-router-dom";

const categoryClass = {
  Conference: "tag-conference",
  Meeting: "tag-meeting",
  Fest: "tag-fest",
  Training: "tag-training",
};

const EventCard = ({ event }) => {
  const date = new Date(event.date);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }).toUpperCase();

  return (
    <div className="event-card">
      <div className={`event-banner ${categoryClass[event.category] || "tag-conference"}`}>
        <span className="event-tag">{event.category}</span>
        <div className="event-date-badge">
          <span className="day">{day}</span>
          <span className="month">{month}</span>
        </div>
      </div>
      <div className="event-body">
        <h3>{event.title}</h3>
        <p className="event-meta">🕐 {event.startTime} - {event.endTime}</p>
        <p className="event-meta">📍 {event.location}</p>
        <Link to={`/events/${event._id}`} className="btn btn-primary btn-block">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
