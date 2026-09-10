import React from 'react';

/**
 * Reusable LoadingSpinner component for async wait states.
 * 
 * @param {Object} props
 * @param {string} [props.message="Loading..."] - Accessible text displayed alongside spinner
 * @param {string} [props.size="medium"] - 'small' | 'medium' | 'large'
 * @param {boolean} [props.fullPage=false] - Whether to center on full page overlay
 */
export default function LoadingSpinner({ 
  message = "Saving Patient Information...", 
  size = "medium",
  fullPage = false 
}) {
  const containerClass = fullPage 
    ? "spinner-overlay" 
    : "spinner-inline";

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`spinner spinner-${size}`} aria-hidden="true"></div>
      {message && <span className="spinner-message">{message}</span>}
    </div>
  );
}
