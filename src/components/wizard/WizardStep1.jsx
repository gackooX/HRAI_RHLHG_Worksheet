import React from 'react';
import DimensionInput from '../DimensionInput';
import { getLevelLabel } from '../../utils/calculations';

const WizardStep1 = ({ room, projectState, updateRoom, onUpdateProject }) => {
  const { foundationType, numStoreys } = projectState.foundation;

  const getLevelOptions = () => {
    const options = [];
    const maxLevel = foundationType === 'Basement' ? numStoreys + 1 : numStoreys;
    for (let i = 1; i <= maxLevel; i++) {
        options.push({ value: i, label: getLevelLabel(i, projectState) });
    }
    return options;
  };

  const isMetric = projectState.displayUnits === 'METRIC';


  return (
    <div className="space-y-6">
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
          <label htmlFor="level" className="block text-sm font-medium">Building Level</label>
          <select
            id="level"
            className="w-full border p-2 rounded bg-white"
            value={room.level || 1}
            onChange={(e) => {
              const newLevel = parseInt(e.target.value);
              const updates = { level: newLevel };
              if (newLevel !== 1) {
                updates.foundationConductiveLoss = 0;
              }
              updateRoom(updates);
            }}
          >
            {getLevelOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <DimensionInput
          id="perimeter" label="Perimeter (PE)" type="length" isMetric={isMetric}
          value={room.perimeter || 0} onChange={(v) => updateRoom({ perimeter: v })}
        />
        <DimensionInput
          id="floor-area" label="Floor Area (AF)" type="area" isMetric={isMetric}
          value={room.floorArea || 0} onChange={(v) => updateRoom({ floorArea: v })}
        />
        <DimensionInput
          id="height" label="Height (H)" type="length" isMetric={isMetric}
          value={room.height || 0} onChange={(v) => updateRoom({ height: v })}
        />
      </div>
    </div>
  );
};

export default WizardStep1;
