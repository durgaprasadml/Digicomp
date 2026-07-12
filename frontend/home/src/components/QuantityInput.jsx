import { useState, useEffect } from 'react';

export default function QuantityInput({ value, onChange, min = 1, max = null }) {
  const [qty, setQty] = useState(value || min);

  useEffect(() => {
    setQty(value || min);
  }, [value, min]);

  const handleDecrease = () => {
    if (qty > min) {
      const newQty = qty - 1;
      setQty(newQty);
      if (onChange) onChange(newQty);
    }
  };

  const handleIncrease = () => {
    if (max === null || qty < max) {
      const newQty = qty + 1;
      setQty(newQty);
      if (onChange) onChange(newQty);
    }
  };

  const handleChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      val = min;
    } else {
      if (val < min) val = min;
      if (max !== null && val > max) val = max;
    }
    setQty(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex items-center border border-[var(--border)] rounded overflow-hidden w-28 h-10">
      <button
        onClick={handleDecrease}
        className="flex-1 flex justify-center items-center bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-[var(--text)] text-lg"
        disabled={qty <= min}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <input
        type="number"
        value={qty}
        onChange={handleChange}
        min={min}
        max={max || undefined}
        className="w-12 text-center bg-transparent border-none outline-none text-[var(--text)] font-medium p-0 -moz-appearance-none"
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
        aria-label="Quantity"
      />
      <button
        onClick={handleIncrease}
        className="flex-1 flex justify-center items-center bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-[var(--text)] text-lg"
        disabled={max !== null && qty >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
