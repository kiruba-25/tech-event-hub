import { useEffect, useState } from "react";
import "../styles/splash.css";

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500); // start fade at 1.5s
    const finishTimer = setTimeout(() => onFinish(), 2000); // remove splash at 2s
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "splash-fade-out" : ""}`}>
      <div className="splash-logo">
        <span className="splash-letter">E</span>
      </div>
      <div className="splash-text">EVENTHUB</div>
    </div>
  );
};

export default SplashScreen;