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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);

  let countdownLabel = null;
  let countdownClass = "";
  if (diffDays === 0) { countdownLabel = "Today"; countdownClass = "cd-today"; }
  else if (diffDays === 1) { countdownLabel = "Tomorrow"; countdownClass = "cd-soon"; }
  else if (diffDays > 1 && diffDays <= 7) { countdownLabel = `In ${diffDays} days`; countdownClass = "cd-soon"; }
  else if (diffDays > 7) { countdownLabel = `In ${diffDays} days`; countdownClass = "cd-later"; }
  else { countdownLabel = "Past"; countdownClass = "cd-past"; }

  return (
    <div className="event-card">
      <div className={`event-banner ${categoryClass[event.category] || "tag-conference"}`}>
        <span className="event-tag">{event.category}</span>
        <div className="event-date-badge">
          <span className="day">{day}</span>
          <span className="month">{month}</span>
        </div>
        <span className={`event-countdown ${countdownClass}`}>{countdownLabel}</span>
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