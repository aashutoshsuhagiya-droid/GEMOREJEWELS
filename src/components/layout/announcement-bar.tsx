"use client";
import { useState } from "react";
export function AnnouncementBar() { const [visible, setVisible] = useState(true); if (!visible) return null; return <div className="announcement">Planning a December proposal? Cut-off dates for guaranteed delivery <a href="#crafting">view crafting timeframes →</a><button aria-label="Dismiss announcement" onClick={() => setVisible(false)}>×</button></div>; }
