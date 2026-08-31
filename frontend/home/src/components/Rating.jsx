import { useState } from 'react';

const StarIcon = ({ fillPercentage }) => (
  <>
  <div className="rating__icon">
    {/* Unfilled Background Star */}
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
    </div>
    {/* Filled Foreground Star (Clipped by width) */}
    <div
      className="rating__icon-partial"
      style={{ width: `${fillPercentage}%` }}
    >
      <svg
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  </>
);

export default function Rating({ rating = 0, onChange, maxStars = 5, isReadOnly = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);
  const cls = `rating${ 'md' !== size ? ' rating--' + size : '' }`

  if (isReadOnly) {
    return (
      <div
        className={ cls }
        role="img"
        aria-label={`Rating: ${rating} out of ${maxStars}`}
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          let fillPercentage = 0;
          if (rating >= index + 1) {
            fillPercentage = 100;
          } else if (rating > index) {
            fillPercentage = (rating - index) * 100;
          }

          return (
            <div key={index} className="rating__item">
              <StarIcon fillPercentage={fillPercentage} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={ cls }
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHoverRating(0)}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);

        return (
          <label
            key={starValue}
            className="rating__item rating__item--interactive"
            onMouseEnter={() => setHoverRating(starValue)}
          >
            <input
              type="radio"
              name="rating"
              value={starValue}
              className="sr-only"
              checked={rating === starValue}
              onChange={() => onChange?.(starValue)}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            />
            <StarIcon fillPercentage={isFilled ? 100 : 0} />
          </label>
        );
      })}
    </div>
  );
}
