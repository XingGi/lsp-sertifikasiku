// frontend/src/components/ClickableCard.jsx
import React from "react";
import { Link } from "react-router-dom";

function ClickableCard({ to, children }) {
  const cardClasses = "block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out";

  return (
    <Link to={to} className={cardClasses}>
      {children}
    </Link>
  );
}

export default ClickableCard;
