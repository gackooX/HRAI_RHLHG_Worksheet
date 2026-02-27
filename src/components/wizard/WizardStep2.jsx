import React from 'react';
import library from '../../data/library.json';

const WizardStep2 = ({ room, updateRoom }) => {
  const handleWindowChange = (dir, val) => {
    const windows = { ...room.windows, [dir]: parseFloat(val) || 0 };
    updateRoom({ windows });
  };

  const wallAssemblies = library.assemblies.filter(a => a.type === 'wall');
  const windowAssemblies = library.assemblies.filter(a => a.type === 'window');
  const ceilingAssemblies = library.assemblies.filter(a => a.type === 'ceiling');
  const doorAssemblies = library.assemblies.filter(a => a.type === 'door');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Step 2: Component Entry</h3>

      {/* Assembly Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase text-gray-500">Wall Assembly</label>
          <select
            className="w-full border p-2 rounded text-sm bg-white"
            value={room.wallAssembly || ''}
            onChange={(e) => updateRoom({ wallAssembly: e.target.value })}
          >
            <option value="">Select Wall...</option>
            {wallAssemblies.map(a => <option key={a.id} value={a.id}>{a.description} (U={a.uFactor})</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase text-gray-500">Window Assembly</label>
          <select
            className="w-full border p-2 rounded text-sm bg-white"
            value={room.windowAssembly || ''}
            onChange={(e) => updateRoom({ windowAssembly: e.target.value })}
          >
            <option value="">Select Window...</option>
            {windowAssemblies.map(a => <option key={a.id} value={a.id}>{a.description} (U={a.uFactor})</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase text-gray-500">Ceiling Assembly</label>
          <select
            className="w-full border p-2 rounded text-sm bg-white"
            value={room.ceilingAssembly || ''}
            onChange={(e) => updateRoom({ ceilingAssembly: e.target.value })}
          >
            <option value="">Select Ceiling...</option>
            {ceilingAssemblies.map(a => <option key={a.id} value={a.id}>{a.description} (U={a.uFactor})</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase text-gray-500">Door Assembly</label>
          <div className="flex gap-2">
            <select
              className="flex-1 border p-2 rounded text-sm bg-white"
              value={room.doorAssembly || ''}
              onChange={(e) => updateRoom({ doorAssembly: e.target.value })}
            >
              <option value="">Select Door...</option>
              {doorAssemblies.map(a => <option key={a.id} value={a.id}>{a.description} (U={a.uFactor})</option>)}
            </select>
            <input
              type="number"
              placeholder="Area"
              className="w-20 border p-2 rounded text-sm"
              value={room.doorArea || 0}
              onChange={(e) => updateRoom({ doorArea: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <h4 className="font-semibold text-sm">Windows/Glass Area (Directional)</h4>
        <div className="grid grid-cols-3 gap-2">
          {['N_S', 'S', 'E_W', 'NE_W', 'SE_W', 'H'].map(dir => (
            <div key={dir}>
              <label htmlFor={`win-${dir}`} className="block text-[10px] font-black uppercase text-gray-400">{dir.replace('_', '/')}</label>
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
          <label className="block text-sm font-bold mb-2 uppercase text-gray-600">Wall Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
              <input type="radio" className="w-4 h-4" checked={room.wallType === 'AGW'} onChange={() => updateRoom({ wallType: 'AGW' })} />
              Above Grade
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
              <input type="radio" className="w-4 h-4" checked={room.wallType === 'BGW'} onChange={() => updateRoom({ wallType: 'BGW' })} />
              Below Grade
            </label>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border rounded">
          <label className="block text-sm font-bold mb-2 uppercase text-gray-600">Duct Loss (10%)</label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
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
        <label htmlFor="occupancy" className="block text-sm font-bold mb-1 uppercase text-blue-800">Occupancy (Gain Section 13)</label>
        <div className="flex items-center gap-2">
          <input
            id="occupancy"
            type="number"
            className="w-20 border p-2 rounded font-bold"
            value={room.occupancy || 0}
            onChange={(e) => updateRoom({ occupancy: parseInt(e.target.value) || 0 })}
          />
          <span className="text-xs text-blue-800 font-bold">People (× 239 BTU/h)</span>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2;
