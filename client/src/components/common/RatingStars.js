import React, { useState } from 'react';
import './RatingStars.css';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium',
  interactive = false,
  onRatingChange = null 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const numericRating = parseFloat(rating) || 0;

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange && starValue !== numericRating) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getStarClass = (starValue) => {
    let baseClass = `star ${size}`;
    
    // Use hover rating if hovering, otherwise use actual rating
    const currentRating = interactive && hoverRating ? hoverRating : numericRating;
    
    if (starValue <= currentRating) {
      baseClass += ' filled';
    } else if (starValue - 0.5 <= currentRating) {
      baseClass += ' half-filled';
    } else {
      baseClass += ' empty';
    }
    
    if (interactive) {
      baseClass += ' interactive';
    }
    
    return baseClass;
  };

  return (
    <div className="rating-stars">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={getStarClass(starValue)}
            onClick={() => handleStarClick(starValue)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStarClick(starValue);
              }
            }}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : 'img'}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
      {numericRating > 0 && (
        <span className="rating-text" aria-live="polite">
          ({numericRating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
