import React from 'react';

const DimensionInput = ({ label, value, id, isMetric, type, onChange, placeholder }) => {
  // value is always stored in Imperial (ft, sq ft, etc)
  // type: 'length', 'area', 'volume'

  const getDisplayValue = () => {
    if (value === null || value === undefined || value === '') return '';
    if (!isMetric) return value;
    if (type === 'length') return Math.round(value * 0.3048 * 100) / 100;
    if (type === 'area') return Math.round(value * 0.092903 * 100) / 100;
    if (type === 'volume') return Math.round(value * 0.0283168 * 100) / 100;
    return value;
  };

  const getUnitLabel = () => {
    if (!isMetric) {
        if (type === 'length') return 'ft';
        if (type === 'area') return 'sq ft';
        if (type === 'volume') return 'ft³';
    } else {
        if (type === 'length') return 'm';
        if (type === 'area') return 'm²';
        if (type === 'volume') return 'm³';
    }
    return '';
  };

  const handleChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
        onChange(placeholder !== undefined ? null : 0);
        return;
    }
    const newVal = parseFloat(rawVal);
    if (isNaN(newVal)) return;

    // Convert back to Imperial for storage
    let storageValue = newVal;
    if (isMetric) {
        if (type === 'length') storageValue = newVal / 0.3048;
        if (type === 'area') storageValue = newVal / 0.092903;
        if (type === 'volume') storageValue = newVal / 0.0283168;
    }
    onChange(storageValue);
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase text-gray-500">{label}</label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="number"
          step="0.01"
          className="w-full border p-2 rounded font-bold"
          value={getDisplayValue()}
          placeholder={placeholder !== undefined ? placeholder : ''}
          onChange={handleChange}
        />
        <span className="text-sm font-bold w-12">{getUnitLabel()}</span>
      </div>
    </div>
  );
};

export default DimensionInput;
