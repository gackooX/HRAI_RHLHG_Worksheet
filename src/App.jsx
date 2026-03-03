import React, { useState, useMemo } from 'react';
import WizardContainer from './components/wizard/WizardContainer';
import ReportGenerator from './components/ReportGenerator';
import TempInput from './components/TempInput';
import { initialState } from './state/projectState';
import { calculateRoomMetrics } from './utils/calculations';
import { convertTemp, convertTempDelta } from './utils/unitConverter';
import { complianceData } from './data/complianceData';
import ComponentTable from './components/ComponentTable';

function App() {
  const [state, setState] = useState(initialState);
  const [activeRoomIndex, setActiveRoomIndex] = useState(null);
  const [view, setView] = useState('wizard'); // 'wizard' or 'report'

  const handleUpdateProject = (key, value) => {
    setState(prev => {
      const newState = {
        ...prev,
        [key]: { ...prev[key], ...value }
      };

      // If compliance package changes, reset effRValues
      if (key === 'compliance' && value.selectedPackage && value.selectedPackage !== prev.compliance.selectedPackage) {
        const pkg = complianceData[value.selectedPackage];
        newState.compliance.effRValues = {
          windows: pkg.windows.effectiveR,
          doors: pkg.doors.effectiveR,
          bgw: pkg.basementWalls.effectiveR,
          agw: pkg.wallsAboveGrade.effectiveR,
          header: pkg.wallsAboveGrade.effectiveR,
          ceiling: pkg.ceilingWithoutAttic.effectiveR,
          floor: pkg.exposedFloor.effectiveR
        };
      }

      return newState;
    });
  };

  const handleUpdateRoom = (roomData) => {
    setState(prev => {
      const newRooms = [...prev.rooms];
      newRooms[activeRoomIndex] = roomData;
      return { ...prev, rooms: newRooms };
    });
  };

  const addNewRoom = () => {
    const defaultLevel = state.foundation.foundationType === 'Basement' ? 'Basement' : 'Level 1';
    const defaultHeight = state.foundation.floorHeights[defaultLevel] || 8;
    const newRoom = {
      name: '',
      level: defaultLevel,
      perimeter: 0,
      floorArea: 0,
      height: defaultHeight,
      windows: {},
      wallType: 'AGW',
      hasDuctLoss: false,
      occupancy: 0
    };
    setState(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setActiveRoomIndex(state.rooms.length);
  };

  const processedRooms = useMemo(() => {
    return state.rooms.map(room => calculateRoomMetrics(room, state));
  }, [state]);

  const totalArea = useMemo(() => {
    return processedRooms.reduce((sum, r) => sum + (r.floorArea || 0), 0);
  }, [processedRooms]);

  const totalVolume = useMemo(() => {
    return processedRooms.reduce((sum, r) => sum + (r.volume || 0), 0);
  }, [processedRooms]);

  const processedState = { ...state, rooms: processedRooms };
  const isMetric = state.displayUnits === 'METRIC';

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
              <option value="IMPERIAL">Imperial (F)</option>
              <option value="METRIC">Metric (C)</option>
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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Dashboard Summary & Global Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border md:col-span-3">
              <h2 className="text-sm font-black uppercase mb-4 text-blue-900 border-b pb-2">Global Design & General Info</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">City Selection</label>
                  <input
                    className="w-full border p-1 rounded font-bold text-sm"
                    value={state.header.city}
                    onChange={(e) => handleUpdateProject('header', { city: e.target.value })}
                    placeholder="Enter City..."
                  />
                </div>
                <TempInput
                  id="global-hl-odt" label="ODTH" isMetric={isMetric}
                  value={state.environmental.hl_odt} onChange={(v) => handleUpdateProject('environmental', { hl_odt: v })}
                />
                <TempInput
                  id="global-hl-idt" label="IDTH" isMetric={isMetric}
                  value={state.environmental.hl_idt} onChange={(v) => handleUpdateProject('environmental', { hl_idt: v })}
                />
                <TempInput
                  id="global-hg-odt" label="ODTC" isMetric={isMetric}
                  value={state.environmental.hg_odt} onChange={(v) => handleUpdateProject('environmental', { hg_odt: v })}
                />
                <TempInput
                  id="global-hg-idt" label="IDTC" isMetric={isMetric}
                  value={state.environmental.hg_idt} onChange={(v) => handleUpdateProject('environmental', { hg_idt: v })}
                />
              </div>
            </div>

            <div className="bg-blue-900 text-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <div className="text-xs font-bold uppercase opacity-70">Building Conditioned Area</div>
                <div className="text-2xl font-black">{totalArea.toLocaleString()} <span className="text-sm font-normal">{isMetric ? 'm²' : 'sq ft'}</span></div>
              </div>
              <div className="text-4xl opacity-20">🏠</div>
            </div>
            <div className="bg-indigo-900 text-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <div className="text-xs font-bold uppercase opacity-70">Total Building Volume (Vb)</div>
                <div className="text-2xl font-black">{totalVolume.toLocaleString()} <span className="text-sm font-normal">{isMetric ? 'm³' : 'ft³'}</span></div>
              </div>
              <div className="text-4xl opacity-20">📦</div>
            </div>
          </div>

          {/* Building Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-black mb-4 border-b pb-2 text-gray-800">Building Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-gray-500">Street #</label>
                <input
                  className="w-full border p-2 rounded font-bold"
                  value={state.header.streetNumber}
                  onChange={(e) => handleUpdateProject('header', { streetNumber: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-500">Street Address</label>
                <input
                  className="w-full border p-2 rounded font-bold"
                  value={state.header.streetAddress}
                  onChange={(e) => handleUpdateProject('header', { streetAddress: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-gray-500">Province</label>
                <input
                  className="w-full border p-2 rounded font-bold"
                  value={state.header.province}
                  onChange={(e) => handleUpdateProject('header', { province: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-gray-500">Postal Code</label>
                <input
                  className="w-full border p-2 rounded font-bold"
                  value={state.header.postalCode}
                  onChange={(e) => handleUpdateProject('header', { postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Front Facing</label>
                <select
                  className="w-full border p-2 rounded font-bold"
                  value={state.header.front_facing_direction}
                  onChange={(e) => handleUpdateProject('header', { front_facing_direction: e.target.value })}
                >
                  {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Number of Storeys (Max 3)</label>
                <input
                  type="number" min={1} max={3}
                  className="w-full border p-2 rounded font-bold"
                  value={state.foundation.numStoreys}
                  onChange={(e) => {
                    let val = parseInt(e.target.value) || 1;
                    if (val > 3) val = 3;
                    if (val < 1) val = 1;
                    handleUpdateProject('foundation', { numStoreys: val });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
               <div className="col-span-4 text-[10px] font-black uppercase text-gray-400 mb-2">Floor Heights</div>
               {['Basement', 'Level 1', 'Level 2', 'Level 3'].map(lvl => (
                 <div key={lvl}>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">{lvl} Height</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" className="w-full border p-2 rounded font-bold"
                        value={state.foundation.floorHeights[lvl]}
                        onChange={(e) => {
                          const floorHeights = { ...state.foundation.floorHeights, [lvl]: parseFloat(e.target.value) || 0 };
                          handleUpdateProject('foundation', { floorHeights });
                        }}
                      />
                      <span className="text-xs font-bold text-gray-400">ft</span>
                    </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Foundation Type</label>
                <select
                  className="w-full border p-2 rounded font-bold"
                  value={state.foundation.foundationType}
                  onChange={(e) => handleUpdateProject('foundation', { foundationType: e.target.value })}
                >
                  <option value="Basement">Basement</option>
                  <option value="Slab on Grade">Slab on Grade</option>
                </select>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-xs font-black uppercase text-gray-700 mb-3">Ventilation System Case Selection</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'Case #1', label: 'Case #1: Exhaust Only System' },
                  { id: 'Case #2', label: 'Case #2: Direct Ducted System' },
                  { id: 'Case #3', label: 'Case #3: Central Forced Air System' }
                ].map(c => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition border border-transparent hover:border-gray-200">
                    <input
                      type="radio" name="system_case" className="w-4 h-4"
                      checked={state.header.system_case === c.id}
                      onChange={() => handleUpdateProject('header', { system_case: c.id })}
                    />
                    <span className="text-sm font-bold text-gray-900">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Heat Loss Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-black mb-4 border-b pb-2 text-red-700">Heat Loss</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TempInput
                id="soil-temp" label="Mean Soil Temp" isMetric={isMetric}
                value={state.environmental.hl_mean_soil_temp} onChange={(v) => handleUpdateProject('environmental', { hl_mean_soil_temp: v })}
              />
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500">Building Air Leakage Heat Loss (LRairh)</label>
                <input
                  type="number" step="0.001" className="w-full border p-2 rounded font-bold"
                  value={state.externalValues.LRairh}
                  onChange={(e) => handleUpdateProject('externalValues', { LRairh: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-center p-2 bg-red-50 rounded border border-red-100">
                <span className="text-red-600 font-black text-sm">
                  HL ΔT: {isMetric
                    ? Math.round(convertTempDelta(state.environmental.hl_idt - state.environmental.hl_odt) * 10) / 10
                    : state.environmental.hl_idt - state.environmental.hl_odt}
                </span>
              </div>
              <div>
                <label htmlFor="hrv" className="block text-xs font-bold uppercase text-gray-500 mb-1">HRV Sensible Effectiveness</label>
                <input
                  id="hrv" type="number" step="0.1" max="1.0" min="0"
                  className="w-full border p-2 rounded font-bold"
                  value={state.system.hrv_effectiveness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 1.0) return;
                    handleUpdateProject('system', { hrv_effectiveness: val || 0 });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Heat Gain Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-black mb-4 border-b pb-2 text-blue-700">Heat Gain</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Daily Range (ΔT)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-full border p-2 rounded font-bold"
                    value={isMetric ? Math.round(convertTempDelta(state.environmental.hg_daily_range) * 10) / 10 : state.environmental.hg_daily_range}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleUpdateProject('environmental', { hg_daily_range: isMetric ? convertTempDelta(val, false) : val });
                    }}
                  />
                  <span className="text-sm font-bold w-8">{isMetric ? '°C' : '°F'}</span>
                </div>
              </div>
              <div>
                <label htmlFor="latitude" className="block text-[10px] font-bold uppercase text-gray-500">North Latitude</label>
                <div className="flex items-center gap-1">
                  <input
                    id="latitude" type="number" className="w-full border p-2 rounded font-bold"
                    value={state.environmental.hg_north_latitude}
                    onChange={(e) => handleUpdateProject('environmental', { hg_north_latitude: parseInt(e.target.value) || 0 })}
                  />
                  <span className="text-sm font-bold w-8">°N</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500">Air Leakage Factor (LRairc)</label>
                <input
                  type="number" step="0.001" className="w-full border p-2 rounded font-bold"
                  value={state.externalValues.LRairc}
                  onChange={(e) => handleUpdateProject('externalValues', { LRairc: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-center p-2 bg-blue-50 rounded border border-blue-100">
                <span className="text-blue-600 font-black text-sm">
                  HG ΔT: {isMetric
                    ? Math.round(convertTempDelta(state.environmental.hg_odt - state.environmental.hg_idt) * 10) / 10
                    : state.environmental.hg_odt - state.environmental.hg_idt}
                </span>
              </div>
              <div className="col-span-2 p-2 bg-blue-50 rounded border border-blue-100 flex items-center">
                 <span className="text-blue-800 text-[10px] font-bold uppercase">Note: Transparent Assembly Heat Gain Multiplier (THGM) is calculated per window orientation.</span>
              </div>
            </div>
          </div>

          {/* Building Components (Compliance) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-black mb-4 border-b pb-2 text-gray-800">Building Components (Compliance Package)</h2>
            <div className="mb-6 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select Compliance Package (Table 3.1.1.2.A)</label>
                <select
                  className="w-full md:w-64 border p-2 rounded font-bold bg-blue-50 border-blue-200"
                  value={state.compliance.selectedPackage}
                  onChange={(e) => handleUpdateProject('compliance', { selectedPackage: e.target.value })}
                >
                  {Object.keys(complianceData).map(pkg => <option key={pkg} value={pkg}>{pkg}</option>)}
                </select>
              </div>
              <div className="flex-1">
                 <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Package Requirements Summary</div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-1 border">Component</th>
                          <th className="p-1 border">Min. Nominal R</th>
                          <th className="p-1 border">Min. Effective R</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Ceiling (No Attic)', key: 'ceilingWithoutAttic' },
                          { label: 'Exposed Floor', key: 'exposedFloor' },
                          { label: 'Above Grade Wall', key: 'wallsAboveGrade' },
                          { label: 'Basement Wall', key: 'basementWalls' },
                        ].map(item => {
                          const data = complianceData[state.compliance.selectedPackage][item.key];
                          return (
                            <tr key={item.key}>
                              <td className="p-1 border font-bold">{item.label}</td>
                              <td className="p-1 border">{data.nominalR}</td>
                              <td className="p-1 border">{data.effectiveR}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
               <h3 className="text-sm font-black uppercase text-gray-700">Dynamic Component Lookup Engine</h3>
               <ComponentTable state={state} onUpdate={handleUpdateProject} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
               <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Windows & Doors</div>
                  <div className="text-sm">Max U: <strong>{complianceData[state.compliance.selectedPackage].windows.maxU}</strong></div>
                  <div className="text-sm">Energy Rating: <strong>{complianceData[state.compliance.selectedPackage].windows.energyRating}</strong></div>
               </div>
               <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Space Heating Equipment</div>
                  <div className="text-sm">Min AFUE: <strong>{complianceData[state.compliance.selectedPackage].heating.minAFUE}</strong></div>
               </div>
               <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">HRV / Domestic Water</div>
                  <div className="text-sm">HRV SRE: <strong>{complianceData[state.compliance.selectedPackage].hrv.minSRE}</strong></div>
                  <div className="text-sm">DWH EF: <strong>{complianceData[state.compliance.selectedPackage].dwh.minEF}</strong></div>
               </div>
            </div>
          </div>

          {/* Room List / Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {processedRooms.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRoomIndex(i)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${activeRoomIndex === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="font-black text-blue-900">{r.name || `Room ${i+1}`}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{r.level} • {r.totalRoomLoss} / {r.totalRoomGain}</div>
              </button>
            ))}
            <button
              onClick={addNewRoom}
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold hover:border-gray-400 hover:text-gray-500 bg-white"
            >
              + Add New Room
            </button>
          </div>

          {activeRoomIndex !== null && (
            <WizardContainer
              room={state.rooms[activeRoomIndex]}
              projectState={state}
              onUpdate={handleUpdateRoom}
              onComplete={() => setActiveRoomIndex(null)}
              onCancel={() => setActiveRoomIndex(null)}
              onUpdateProject={handleUpdateProject}
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
