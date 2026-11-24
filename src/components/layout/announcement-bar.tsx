"use client";
import { useState } from "react";
export function AnnouncementBar() { const [visible, setVisible] = useState(true); if (!visible) return null; return <div className="announcement"><p className="announcement-message"><span className="announcement-lead">Planning a December proposal? </span>Cut-off dates for guaranteed delivery <a href="#crafting">view crafting timeframes →</a></p><button aria-label="Dismiss announcement" onClick={() => setVisible(false)}>×</button></div>; }
