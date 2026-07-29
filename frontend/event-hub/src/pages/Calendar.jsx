import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/calendar.css";

const Calendar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const d = new Date(ev.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[d.getDate()] = map[d.getDate()] || [];
        map[d.getDate()].push(ev);
      }
    });
    return map;
  }, [events, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = cursor.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Calendar View" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="calendar-toolbar">
            <div className="calendar-nav">
              <button onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
              <span>{monthLabel}</span>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div className="calendar-head" key={d}>{d}</div>
            ))}
            {cells.map((d, i) => (
              <div className={`calendar-cell ${d ? "" : "empty"}`} key={i}>
                {d && <span className="cell-date">{d}</span>}
                {d &&
                  (eventsByDay[d] || []).map((ev) => (
                    <div className="cell-event" key={ev._id} title={ev.title}>
                      {ev.title}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
