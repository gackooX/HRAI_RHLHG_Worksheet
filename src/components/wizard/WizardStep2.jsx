import React from 'react';

const WizardStep2 = ({ room, updateRoom }) => {
  const handleWindowChange = (dir, val) => {
    const windows = { ...room.windows, [dir]: parseFloat(val) || 0 };
    updateRoom({ windows });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Step 2: Component Entry</h3>

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Windows/Glass Area (Directional)</h4>
        <div className="grid grid-cols-3 gap-2">
          {['N_S', 'S', 'E_W', 'NE_W', 'SE_W', 'H'].map(dir => (
            <div key={dir}>
              <label htmlFor={`win-${dir}`} className="block text-xs uppercase">{dir.replace('_', '/')}</label>
              <input
                id={`win-${dir}`}
                type="number"
                className="w-full border p-1 rounded"
                value={room.windows?.[dir] || 0}
                onChange={(e) => handleWindowChange(dir, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 border rounded">
          <label className="block text-sm font-bold mb-2">Wall Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" checked={room.wallType === 'AGW'} onChange={() => updateRoom({ wallType: 'AGW' })} />
              Above Grade (AGW)
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={room.wallType === 'BGW'} onChange={() => updateRoom({ wallType: 'BGW' })} />
              Below Grade (BGW)
            </label>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border rounded">
          <label className="block text-sm font-bold mb-2">Duct Loss (10%)</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={room.hasDuctLoss}
              onChange={(e) => updateRoom({ hasDuctLoss: e.target.checked })}
            />
            Include Duct Loss
          </label>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded">
        <label htmlFor="occupancy" className="block text-sm font-bold mb-1">Occupancy (Gain Section 13)</label>
        <div className="flex items-center gap-2">
          <input
            id="occupancy"
            type="number"
            className="w-20 border p-1 rounded"
            value={room.occupancy || 0}
            onChange={(e) => updateRoom({ occupancy: parseInt(e.target.value) || 0 })}
          />
          <span className="text-xs text-blue-800">People (× 239 BTU/h)</span>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2;
