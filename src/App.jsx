import React, { useState, useMemo, useEffect } from 'react';
import WizardContainer from './components/wizard/WizardContainer';
import ReportGenerator from './components/ReportGenerator';
import THGMWorksheet from './components/THGMWorksheet';
import LibraryPage from './components/LibraryPage';
import RoomManagement from './components/RoomManagement';
import { initialState } from './state/projectState';
import { calculateRoomMetrics } from './utils/calculations';
import { complianceData } from './data/complianceData';
import ComponentTable from './components/ComponentTable';
import library from './data/library.json';
import DimensionInput from './components/DimensionInput';
import TempInput from './components/TempInput';

function App() {
  const [state, setState] = useState(initialState);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [view, setView] = useState('building'); // 'building', 'rooms', 'thgm', 'report', or 'library'

  const handleUpdateProject = (key, value) => {
    setState(prev => {
      const newState = {
        ...prev,
        [key]: { ...prev[key], ...value }
      };

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

  const handleRemoveRoom = (index) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
    if (activeRoomIndex === index) setActiveRoomIndex(null);
  };

  const handleDuplicateRoom = (index) => {
    setState(prev => {
      const roomToCopy = { ...prev.rooms[index], name: prev.rooms[index].name + ' (Copy)' };
      return { ...prev, rooms: [...prev.rooms, roomToCopy] };
    });
  };

  const addNewRoom = () => {
    const isBasement = state.foundation.foundationType === 'Basement';
    const defaultLevel = isBasement ? 'Level 1 (Basement)' : 'Level 1 (Ground)';
    const defaultHeight = state.foundation.floorHeights[isBasement ? 'Basement' : 'Level 1'] || 8;
    const newRoom = {
      name: '',
      level: defaultLevel,
      perimeter: 0,
      floorArea: 0,
      height: defaultHeight,
      foundationLossWatts: 0,
      customComponentAreas: {}, // { [index]: area }
      windows: {
        'N_S': { area: 0, ...state.globalWindowConfig },
        'S': { area: 0, ...state.globalWindowConfig },
        'E_W': { area: 0, ...state.globalWindowConfig },
        'NE_NW': { area: 0, ...state.globalWindowConfig },
        'SE_SW': { area: 0, ...state.globalWindowConfig },
        'H': { area: 0, ...state.globalWindowConfig }
      },
      wallType: 'AGW',
      hasDuctLoss: false,
      occupancy: 0
    };
    setState(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setActiveRoomIndex(state.rooms.length);
    setIsWizardOpen(true);
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

  const c_to_f = (c) => Math.round((c * 1.8) + 32);

  const handleSaveProject = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-${state.header.streetAddress || 'new'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = JSON.parse(evt.target.result);
        setState(loaded);
      } catch (err) {
        alert('Failed to load project file.');
      }
    };
    reader.readAsText(file);
  };

  // Provinces sourced from weather library
  const provinces = useMemo(() => {
    const pSet = new Set(library.designConditions.locations.map(l => l.province));
    return Array.from(pSet).sort();
  }, []);

  const filteredCities = useMemo(() => {
    if (!state.header.province) return [];
    return library.designConditions.locations.filter(l =>
      l.province === state.header.province &&
      l.cityName.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [state.header.province, citySearch]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      {/* Navigation / Header */}
      <div className="no-print mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-2xl gap-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'building', label: 'Building Manager', icon: '🏢' },
            { id: 'rooms', label: 'Room Manager', icon: '🏠' },
            { id: 'thgm', label: 'THGM Engine', icon: '☀️' },
            { id: 'report', label: 'Final Report', icon: '📄' },
            { id: 'library', label: 'Library', icon: '📚' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setView(btn.id)}
              className={`px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${view === btn.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <span>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <label className="text-gray-500 mb-0">Measurement System</label>
             <select
              className="bg-gray-100 border-gray-300 text-gray-900 font-black text-xs p-1 rounded uppercase"
              value={state.displayUnits}
              onChange={(e) => setState(prev => ({ ...prev, displayUnits: e.target.value }))}
            >
              <option value="IMPERIAL">Imperial (F/BTU)</option>
              <option value="METRIC">Metric (C/Watts)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveProject}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-black uppercase text-[10px] border border-gray-300 transition-colors"
            >
              💾 Save
            </button>
            <label className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-black uppercase text-[10px] border border-gray-300 transition-colors cursor-pointer">
              📂 Load
              <input type="file" className="hidden" onChange={handleLoadProject} accept=".json" />
            </label>
            <button
              onClick={() => window.print()}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] shadow-lg transition-transform active:scale-95"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {view === 'building' && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl flex justify-between items-center group hover:border-blue-500/50 transition-colors">
              <div>
                <label>Total Conditioned Area</label>
                <div className="text-4xl font-black text-gray-900 tracking-tighter">{totalArea.toLocaleString()} <span className="text-sm font-normal text-gray-500 uppercase">{isMetric ? 'm²' : 'sq ft'}</span></div>
              </div>
              <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity">🏢</div>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
              <div>
                <label>Total Volume (Vb)</label>
                <div className="text-4xl font-black text-gray-900 tracking-tighter">{totalVolume.toLocaleString()} <span className="text-sm font-normal text-gray-500 uppercase">{isMetric ? 'm³' : 'ft³'}</span></div>
              </div>
              <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity">📦</div>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl flex justify-between items-center group hover:border-red-500/50 transition-colors">
              <div>
                <label>Total Heating Load</label>
                <div className="text-4xl font-black text-red-500 tracking-tighter">{processedRooms.reduce((sum, r) => sum + r.totalRoomLoss, 0).toLocaleString()} <span className="text-sm font-normal text-gray-500 uppercase">BTU/H</span></div>
              </div>
              <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity">🔥</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Building Info Panel */}
            <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl h-fit sticky top-8">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-l-4 border-blue-600 pl-4">Building Information</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label>Street #</label>
                    <input
                      className="w-full"
                      value={state.header.streetNumber}
                      onChange={(e) => handleUpdateProject('header', { streetNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label>Street Address</label>
                    <input
                      className="w-full"
                      value={state.header.streetAddress}
                      onChange={(e) => handleUpdateProject('header', { streetAddress: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Province Filter</label>
                    <select
                      className="w-full"
                      value={state.header.province}
                      onChange={(e) => {
                         handleUpdateProject('header', { province: e.target.value, city: '' });
                         setCitySearch('');
                      }}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <label>City / Location</label>
                    <input
                      className="w-full"
                      disabled={!state.header.province}
                      value={citySearch || state.header.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCitySearch(val);
                        handleUpdateProject('header', { city: val });
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowCityDropdown(false), 200);
                      }}
                      placeholder={state.header.province ? "Type city name..." : "Select province first"}
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full bg-gray-100 border border-gray-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto mt-1 divide-y divide-gray-700">
                        {filteredCities.map(loc => (
                            <div
                              key={loc.city}
                              className="p-3 hover:bg-blue-900/40 cursor-pointer text-[10px] font-black uppercase transition-colors"
                              onClick={() => {
                                handleUpdateProject('header', { city: loc.cityName });
                                handleUpdateProject('environmental', {
                                  hl_odt: c_to_f(loc.odtHeating),
                                  hg_odt: c_to_f(loc.odtCooling),
                                  hg_daily_range: loc.strange * 1.8,
                                  hg_north_latitude: loc.latitude,
                                  hl_mean_soil_temp: c_to_f(loc.dgTemp || 10),
                                  degDay: loc.degDay,
                                  ohr: loc.ohr
                                });
                                setCitySearch(loc.cityName);
                                setShowCityDropdown(false);
                              }}
                            >
                              {loc.cityName}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label>Postal Code</label>
                    <input
                      className="w-full"
                      value={state.header.postalCode}
                      onChange={(e) => handleUpdateProject('header', { postalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Number of Storeys</label>
                    <select
                      className="w-full"
                      value={state.foundation.numStoreys}
                      onChange={(e) => handleUpdateProject('foundation', { numStoreys: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Foundation Strategy</label>
                    <select
                      className="w-full"
                      value={state.foundation.foundationType}
                      onChange={(e) => handleUpdateProject('foundation', { foundationType: e.target.value })}
                    >
                      <option value="Basement">Basement Scenario</option>
                      <option value="Slab on Grade">Slab on Grade Scenario</option>
                    </select>
                  </div>
                  <div>
                    <label>Wall Below Grade Height (ft)</label>
                    <input
                      type="number" className="w-full"
                      value={state.foundation.wallBelowGradeHeight}
                      onChange={(e) => handleUpdateProject('foundation', {
                        wallBelowGradeHeight: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4">
                 <div className="bg-white/50 p-3 rounded border border-gray-200">
                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Heating ODT</div>
                    <div className="text-xl font-black text-red-500">{state.environmental.hl_odt}&deg;F</div>
                 </div>
                 <div className="bg-white/50 p-3 rounded border border-gray-200">
                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Cooling ODT</div>
                    <div className="text-xl font-black text-blue-500">{state.environmental.hg_odt}&deg;F</div>
                 </div>
              </div>
            </div>

            {/* Global Engineering Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Compliance & Global Logic */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl">
                <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-l-4 border-indigo-600 pl-4">Engineering Overrides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                     <label>Compliance Package (CSA F280-12)</label>
                     <select
                        className="w-full bg-indigo-900/20 border-indigo-500/30 font-black text-indigo-400"
                        value={state.compliance.selectedPackage}
                        onChange={(e) => handleUpdateProject('compliance', { selectedPackage: e.target.value })}
                      >
                        {Object.keys(complianceData).map(pkg => <option key={pkg} value={pkg}>{pkg}</option>)}
                      </select>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox" className="w-4 h-4 rounded bg-gray-100 border-gray-300"
                          checked={state.designMultipliers.includeDuctLoss}
                          onChange={(e) => handleUpdateProject('designMultipliers', { includeDuctLoss: e.target.checked })}
                        />
                        <label className="mb-0">Apply Global Duct Loss/Gain (10%)</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox" className="w-4 h-4 rounded bg-gray-100 border-gray-300"
                          checked={state.designMultipliers.includeExposedFloor}
                          onChange={(e) => handleUpdateProject('designMultipliers', { includeExposedFloor: e.target.checked })}
                        />
                        <label className="mb-0">Global Exposed Floor Calculation</label>
                      </div>
                   </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <TempInput
                    label="Outdoor Design Temp (Heating)"
                    value={state.environmental.hl_odt}
                    id="hl_odt" isMetric={isMetric}
                    onChange={(v) => handleUpdateProject('environmental', { hl_odt: v })}
                  />
                  <TempInput
                    label="Indoor Design Temp (Heating)"
                    value={state.environmental.hl_idt}
                    id="hl_idt" isMetric={isMetric}
                    onChange={(v) => handleUpdateProject('environmental', { hl_idt: v })}
                  />
                  <TempInput
                    label="Mean Soil Temp (DG TEMP)"
                    value={state.environmental.hl_mean_soil_temp}
                    id="hl_mean_soil_temp" isMetric={isMetric}
                    onChange={(v) => handleUpdateProject('environmental', { hl_mean_soil_temp: v })}
                  />
                  <TempInput
                    label="Outdoor Design Temp (Cooling)"
                    value={state.environmental.hg_odt}
                    id="hg_odt" isMetric={isMetric}
                    onChange={(v) => handleUpdateProject('environmental', { hg_odt: v })}
                  />
                  <TempInput
                    label="Indoor Design Temp (Cooling)"
                    value={state.environmental.hg_idt}
                    id="hg_idt" isMetric={isMetric}
                    onChange={(v) => handleUpdateProject('environmental', { hg_idt: v })}
                  />
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">Strange (Summer Range)</label>
                    <input
                      type="number" className="w-full border p-2 rounded font-bold bg-gray-100 text-gray-900"
                      value={state.environmental.hg_daily_range}
                      onChange={(e) => handleUpdateProject('environmental', { hg_daily_range: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">DegDay (Heating)</label>
                    <input
                      type="number" className="w-full border p-2 rounded font-bold bg-gray-100 text-gray-900"
                      value={state.environmental.degDay}
                      onChange={(e) => handleUpdateProject('environmental', { degDay: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">OHR (Overhang Ratio)</label>
                    <input
                      type="number" step="0.1" className="w-full border p-2 rounded font-bold bg-gray-100 text-gray-900"
                      value={state.environmental.ohr}
                      onChange={(e) => handleUpdateProject('environmental', { ohr: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="mt-8 overflow-x-auto">
                   <ComponentTable state={state} onUpdate={handleUpdateProject} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'rooms' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <RoomManagement
            rooms={processedRooms}
            activeIndex={activeRoomIndex}
            onSelect={(idx, openWizard = false) => {
              setActiveRoomIndex(idx);
              if (openWizard) setIsWizardOpen(true);
            }}
            onAdd={addNewRoom}
            onRemove={handleRemoveRoom}
            onDuplicate={handleDuplicateRoom}
          />

          {isWizardOpen && activeRoomIndex !== null && (
            <WizardContainer
              room={state.rooms[activeRoomIndex]}
              projectState={state}
              onUpdate={handleUpdateRoom}
              onComplete={() => setIsWizardOpen(false)}
              onCancel={() => setIsWizardOpen(false)}
              onUpdateProject={handleUpdateProject}
            />
          )}
        </div>
      )}

      {view === 'thgm' && (
        <div className="max-w-6xl mx-auto py-8">
           <THGMWorksheet state={state} onUpdateProject={handleUpdateProject} />
        </div>
      )}

      {view === 'report' && (
        <div className="flex justify-center">
          <ReportGenerator state={processedState} />
        </div>
      )}

      {view === 'library' && (
        <LibraryPage />
      )}

      {/* Print Only View */}
      <div className="hidden print:block">
        <ReportGenerator state={processedState} />
      </div>
    </div>
  );
}

export default App;
