import React from 'react';

const WizardStep1 = ({ room, updateRoom }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Step 1: Room Dimensions</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="room-name" className="block text-sm font-medium">Room Name (Max 8 chars)</label>
          <input
            id="room-name"
            type="text"
            maxLength={8}
            className="w-full border p-2 rounded"
            value={room.name || ''}
            onChange={(e) => updateRoom({ name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium">Level (1-4)</label>
          <select
            id="level"
            className="w-full border p-2 rounded"
            value={room.level || 1}
            onChange={(e) => updateRoom({ level: parseInt(e.target.value) })}
          >
            {[1, 2, 3, 4].map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="perimeter" className="block text-sm font-medium">Perimeter (PE) ft</label>
          <input
            id="perimeter"
            type="number"
            className="w-full border p-2 rounded"
            value={room.perimeter || 0}
            onChange={(e) => updateRoom({ perimeter: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label htmlFor="floor-area" className="block text-sm font-medium">Floor Area (AF) sq ft</label>
          <input
            id="floor-area"
            type="number"
            className="w-full border p-2 rounded"
            value={room.floorArea || 0}
            onChange={(e) => updateRoom({ floorArea: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium">Height (H) ft</label>
          <input
            id="height"
            type="number"
            className="w-full border p-2 rounded"
            value={room.height || 0}
            onChange={(e) => updateRoom({ height: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
};

export default WizardStep1;
