import { useState } from 'react';
import Rating from '../components/Rating';

export const Default = () => {
  const [rating, setRating] = useState(3);
  return (
    <div>
      <h2 className="text-xl mb-4 font-bold">Star Rating Component</h2>
      <Rating rating={rating} onChange={setRating} />
      <p className="mt-4 text-sm text-gray-500">Current Rating: {rating}</p>
    </div>
  );
};

export const Sizes = () => {
  const [rating, setRating] = useState(3);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Rating Sizes</h2>

      <div>
        <p className="my-4 text-sm text-gray-500">Size: sm</p>
        <Rating rating={rating} onChange={setRating} size="sm" />
      </div>

      <div>
        <p className="my-4 text-sm text-gray-500">Size: md</p>
        <Rating rating={rating} onChange={setRating} />
      </div>

      <div>
        <p className="my-4 text-sm text-gray-500">Size: lg</p>
        <Rating rating={rating} onChange={setRating} size="lg" />
      </div>

    </div>
  );
};

export const ReadOnly = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Read Only (Fractional) Ratings</h2>

      <div>
        <p className="mb-2 text-sm text-gray-500">Rating: 2.3</p>
        <Rating rating={2.3} isReadOnly={true} />
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-500">Rating: 4.8</p>
        <Rating rating={4.8} isReadOnly={true} />
      </div>
    </div>
  );
};

