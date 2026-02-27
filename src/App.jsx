import React, { useState, useMemo } from 'react';
import WizardContainer from './components/wizard/WizardContainer';
import ReportGenerator from './components/ReportGenerator';
import { initialState } from './state/projectState';
import { calculateRoomMetrics } from './utils/calculations';

function App() {
  const [state, setState] = useState(initialState);
  const [activeRoomIndex, setActiveRoomIndex] = useState(null);
  const [view, setView] = useState('wizard'); // 'wizard' or 'report'

  const handleUpdateProject = (key, value) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...value }
    }));
  };

  const handleUpdateRoom = (roomData) => {
    setState(prev => {
      const newRooms = [...prev.rooms];
      newRooms[activeRoomIndex] = roomData;
      return { ...prev, rooms: newRooms };
    });
  };

  const addNewRoom = () => {
    const newRoom = {
      name: '',
      level: 1,
      perimeter: 0,
      floorArea: 0,
      height: 8,
      windows: {},
      wallType: 'AGW',
      hasDuctLoss: false,
      occupancy: 0
    };
    setState(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setActiveRoomIndex(state.rooms.length);
  };

  // Processed rooms with calculations injected
  const processedRooms = useMemo(() => {
    return state.rooms.map(room => calculateRoomMetrics(room, state));
  }, [state]);

  const processedState = { ...state, rooms: processedRooms };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Navigation / Header */}
      <div className="no-print mb-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <button
            onClick={() => setView('wizard')}
            className={`px-4 py-2 rounded font-bold ${view === 'wizard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Input Wizard
          </button>
          <button
            onClick={() => setView('report')}
            className={`px-4 py-2 rounded font-bold ${view === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Report Generator
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-bold">
            Units:
            <select
              className="ml-2 border rounded p-1"
              value={state.displayUnits}
              onChange={(e) => setState(prev => ({ ...prev, displayUnits: e.target.value }))}
            >
              <option value="IMPERIAL">Imperial</option>
              <option value="METRIC">Metric</option>
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
          >
            Print Report
          </button>
        </div>
      </div>

      {view === 'wizard' && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Global Project Header Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-black mb-4 border-b pb-2">Project Settings (The Brain)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label htmlFor="project-address" className="block text-xs font-bold uppercase">Address</label>
                <input
                  id="project-address"
                  className="w-full border p-2 rounded"
                  value={state.header.address}
                  onChange={(e) => handleUpdateProject('header', { address: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="facing-direction" className="block text-xs font-bold uppercase">Front Facing</label>
                <select
                  id="facing-direction"
                  className="w-full border p-2 rounded"
                  value={state.header.front_facing_direction}
                  onChange={(e) => handleUpdateProject('header', { front_facing_direction: e.target.value })}
                >
                  {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="num-storeys" className="block text-xs font-bold uppercase">Num Storeys</label>
                <input
                  id="num-storeys"
                  type="number"
                  max={3}
                  className="w-full border p-2 rounded"
                  value={state.foundation.numStoreys}
                  onChange={(e) => handleUpdateProject('foundation', { numStoreys: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label htmlFor="hl-delta-t" className="block text-xs font-bold uppercase text-red-600">HL ΔT</label>
                <input
                  id="hl-delta-t"
                  type="number"
                  className="w-full border p-2 rounded"
                  value={state.designMultipliers.hl_delta_t}
                  onChange={(e) => handleUpdateProject('designMultipliers', { hl_delta_t: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label htmlFor="hg-delta-t" className="block text-xs font-bold uppercase text-blue-600">HG ΔT</label>
                <input
                  id="hg-delta-t"
                  type="number"
                  className="w-full border p-2 rounded"
                  value={state.designMultipliers.hg_delta_t}
                  onChange={(e) => handleUpdateProject('designMultipliers', { hg_delta_t: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label htmlFor="lrairh" className="block text-xs font-bold uppercase">LRairh</label>
                <input
                  id="lrairh"
                  type="number"
                  step="0.001"
                  className="w-full border p-2 rounded"
                  value={state.externalValues.LRairh}
                  onChange={(e) => handleUpdateProject('externalValues', { LRairh: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label htmlFor="lrairc" className="block text-xs font-bold uppercase">LRairc</label>
                <input
                  id="lrairc"
                  type="number"
                  step="0.001"
                  className="w-full border p-2 rounded"
                  value={state.externalValues.LRairc}
                  onChange={(e) => handleUpdateProject('externalValues', { LRairc: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Room List / Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {processedRooms.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRoomIndex(i)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${activeRoomIndex === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="font-black">{r.name || `Room ${i+1}`}</div>
                <div className="text-xs text-gray-500">Lvl {r.level} • {r.totalRoomLoss} Btuh / {r.totalRoomGain} Btuh</div>
              </button>
            ))}
            <button
              onClick={addNewRoom}
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold hover:border-gray-400 hover:text-gray-500"
            >
              + Add Room
            </button>
          </div>

          {activeRoomIndex !== null && (
            <WizardContainer
              room={state.rooms[activeRoomIndex]}
              onUpdate={handleUpdateRoom}
              onComplete={() => setActiveRoomIndex(null)}
              onCancel={() => setActiveRoomIndex(null)}
            />
          )}
        </div>
      )}

      {view === 'report' && (
        <div className="flex justify-center">
          <ReportGenerator state={processedState} />
        </div>
      )}

      {/* Print Only View */}
      <div className="hidden print:block">
        <ReportGenerator state={processedState} />
      </div>
    </div>
  );
}

export default App;
