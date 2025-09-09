import React from 'react';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium',
  interactive = false,
  onRatingChange = null 
}) => {
  // Ensure rating is a number
  const numericRating = parseFloat(rating) || 0;
  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const getStarClass = (starValue) => {
    let baseClass = `star ${size}`;
    
    if (starValue <= numericRating) {
      baseClass += ' filled';
    } else if (starValue - 0.5 <= numericRating) {
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
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : 'img'}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
      {numericRating > 0 && (
        <span className="rating-text">
          ({numericRating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
