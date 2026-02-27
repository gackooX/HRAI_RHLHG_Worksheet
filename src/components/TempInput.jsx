import React from 'react';
import { convertTemp } from '../utils/unitConverter';

const TempInput = ({ label, value, id, isMetric, onChange }) => {
  // value is always stored in Imperial (F)
  const displayValue = isMetric ? Math.round(convertTemp(value, true)) : value;
  const unitLabel = isMetric ? '°C' : '°F';

  const handleChange = (e) => {
    const newVal = parseFloat(e.target.value);
    if (isNaN(newVal)) return;

    // If metric, convert back to Imperial for storage
    const storageValue = isMetric ? Math.round(convertTemp(newVal, false)) : newVal;
    onChange(storageValue);
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase text-gray-500">{label}</label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="number"
          className="w-full border p-2 rounded font-bold"
          value={displayValue}
          onChange={handleChange}
        />
        <span className="text-sm font-bold w-8">{unitLabel}</span>
      </div>
    </div>
  );
};

export default TempInput;
