import React, { useMemo } from 'react';
import library from '../../data/library.json';
import { calculateDetailedAreas, calculateComponentFactors, calculateRoomMetrics, lookupGlazingData } from '../../utils/calculations';

const WizardStep2 = ({ room, updateRoom, projectState, onUpdateProject }) => {
  const isMetric = projectState.displayUnits === 'METRIC';

  const metrics = useMemo(() => calculateRoomMetrics(room, projectState), [room, projectState]);
  const areas = useMemo(() => calculateDetailedAreas(room, projectState), [room, projectState]);
  const factors = useMemo(() => calculateComponentFactors(projectState), [projectState]);

  const handleWindowChange = (dir, field, val) => {
    const current = room.windows[dir] || { area: 0, assemblyId: room.windowAssembly, shadingType: room.shadingType || 'No shades' };
    const updated = typeof current === 'object'
        ? { ...current, [field]: field === 'area' ? (parseFloat(val) || 0) : val }
        : { area: field === 'area' ? (parseFloat(val) || 0) : current, assemblyId: room.windowAssembly, shadingType: room.shadingType || 'No shades', [field]: val };

    const windows = { ...room.windows, [dir]: updated };
    updateRoom({ windows });
  };


  const Row = ({ label, struct, area, hlFactor, loss, hgFactor, gain, isSubhead = false }) => (
    <tr className={`border-b border-gray-200 ${isSubhead ? 'bg-gray-50 font-black text-[10px] uppercase' : 'text-xs'}`}>
      <td className="p-2 border-r font-bold">{label}</td>
      <td className="p-2 border-r text-center text-blue-600 font-bold">{struct}</td>
      <td className="p-2 border-r text-right font-mono bg-green-50">{area}</td>
      <td className="p-2 border-r text-right text-red-700 font-bold italic opacity-60">{hlFactor}</td>
      <td className={`p-2 border-r text-right font-black ${loss !== '---' && parseFloat(loss) > 0 ? 'bg-red-50 text-red-600' : 'text-red-600'}`}>{loss}</td>
      <td className="p-2 border-r text-right text-blue-700 font-bold italic opacity-60">{hgFactor}</td>
      <td className={`p-2 text-right font-black ${gain !== '---' && parseFloat(gain) > 0 ? 'bg-blue-50 text-blue-600' : 'text-blue-600'}`}>{gain}</td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-gray-100 text-gray-900 p-3 rounded-t-lg">
        <h3 className="text-md font-black uppercase tracking-widest">HRAI Worksheet Digital Twin</h3>
        <div className="flex gap-4 text-[10px] font-bold">
            <div className="flex gap-1"><span>PE:</span> <span className="text-gray-900">{room.perimeter}</span></div>
            <div className="flex gap-1"><span>H:</span> <span className="text-gray-900">{room.height}</span></div>
            <div className="flex gap-1"><span>AF:</span> <span className="text-gray-900">{room.floorArea}</span></div>
        </div>
      </div>

      <div className="overflow-x-auto border-x border-b border-gray-300 rounded-b-lg shadow-xl">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-100 text-[10px] uppercase font-black border-b-2 border-gray-200">
            <tr>
              <th className="p-2 border-r text-left w-48">Components</th>
              <th className="p-2 border-r text-center w-16">Struct</th>
              <th className="p-2 border-r text-right w-24">Area</th>
              <th className="p-2 border-r text-right w-24">HL Factor</th>
              <th className="p-2 border-r text-right w-24 text-red-700">Heat Loss</th>
              <th className="p-2 border-r text-right w-24">HG Factor</th>
              <th className="p-2 text-right w-24 text-blue-700">Heat Gain</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. GROSS WALLS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">1. Gross Walls</td>
            </tr>
            <Row
               label="Above Grade Wall" struct="AGW" area={areas.grossAGW.toFixed(1)}
               hlFactor="---" loss="---" hgFactor="---" gain="---"
            />

            {/* 2. EXPOSED DOORS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">2. Exposed Doors</td>
            </tr>
            <tr className="border-b border-gray-200 text-xs">
                <td className="p-2 border-r font-bold">Main Entrance / Exterior</td>
                <td className="p-2 border-r text-center text-blue-600 font-bold">D</td>
                <td className="p-2 border-r text-right font-mono bg-green-50">
                    <input
                        type="number" className="w-full bg-transparent text-right font-mono font-bold outline-none"
                        value={room.doorArea || 0}
                        onChange={(e) => updateRoom({ doorArea: parseFloat(e.target.value) || 0 })}
                    />
                </td>
                <td className="p-2 border-r text-right text-red-700 font-bold italic opacity-60">{factors.doors.hlFactor.toFixed(3)}</td>
                <td className={`p-2 border-r text-right font-black ${Math.round((room.doorArea || 0) * factors.doors.hlFactor) > 0 ? 'bg-red-50 text-red-600' : 'text-red-600'}`}>{Math.round((room.doorArea || 0) * factors.doors.hlFactor)}</td>
                <td className="p-2 border-r text-right text-blue-700 font-bold italic opacity-60">{factors.doors.hgFactor.toFixed(3)}</td>
                <td className={`p-2 text-right font-black ${Math.round((room.doorArea || 0) * factors.doors.hgFactor) > 0 ? 'bg-blue-50 text-blue-600' : 'text-blue-600'}`}>{Math.round((room.doorArea || 0) * factors.doors.hgFactor)}</td>
            </tr>

            {/* 3. NET EXPOSED WALLS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">3. Net Exposed Walls</td>
            </tr>
            <Row
               label="Net AGW" struct="AGW" area={areas.netAGW.toFixed(1)}
               hlFactor={factors.agw.hlFactor.toFixed(3)}
               loss={Math.round(areas.netAGW * factors.agw.hlFactor)}
               hgFactor={factors.agw.hgFactor.toFixed(3)}
               gain={Math.round(areas.netAGW * factors.agw.hgFactor)}
            />
            {room.level?.includes('Level 1') && projectState.foundation.foundationType === 'Basement' && (
                <Row
                   label="Net BGW" struct="BGW" area={areas.netBGW.toFixed(1)}
                   hlFactor={factors.bgw.hlFactor.toFixed(3)}
                   loss={Math.round(areas.netBGW * factors.bgw.hlFactor)}
                   hgFactor={factors.bgw.hgFactor.toFixed(3)}
                   gain={Math.round(areas.netBGW * factors.bgw.hgFactor)}
                />
            )}

            {/* 4. HEADER AREAS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">4. Header Areas</td>
            </tr>
            <Row
               label="Rim Joist / Headers" struct="H" area={areas.headerArea.toFixed(1)}
               hlFactor={factors.header.hlFactor.toFixed(3)}
               loss={Math.round(areas.headerArea * factors.header.hlFactor)}
               hgFactor={factors.header.hgFactor.toFixed(3)}
               gain={Math.round(areas.headerArea * factors.header.hgFactor)}
            />

            {/* 5. EXPOSED CEILINGS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2 flex justify-between items-center">
                <span>5. Exposed Ceilings</span>
                <label className="flex items-center gap-2 cursor-pointer normal-case">
                  <input
                    type="checkbox" className="w-3 h-3"
                    checked={room.hasExposedCeiling !== undefined ? room.hasExposedCeiling : (room.level?.includes('Level 1') && projectState.foundation.numStoreys === 1)}
                    onChange={(e) => updateRoom({ hasExposedCeiling: e.target.checked })}
                  />
                  <span className="text-[8px]">Include in Load</span>
                </label>
              </td>
            </tr>
            {(room.hasExposedCeiling !== undefined ? room.hasExposedCeiling : (room.level?.includes('Level 1') && projectState.foundation.numStoreys === 1)) ? (
              <Row
                label="Ceiling / Roof Assembly" struct="C" area={areas.floorArea.toFixed(1)}
                hlFactor={factors.ceiling.hlFactor.toFixed(3)}
                loss={Math.round(areas.floorArea * factors.ceiling.hlFactor)}
                hgFactor={factors.ceiling.hgFactor.toFixed(3)}
                gain={Math.round(areas.floorArea * factors.ceiling.hgFactor)}
              />
            ) : (
              <Row label="Ceiling / Roof Assembly" struct="C" area="0.0" hlFactor="---" loss="0" hgFactor="---" gain="0" />
            )}

            {/* 6. WINDOWS, GLASS DOORS & SKYLIGHTS */}
            <tr className="bg-gray-100 font-bold text-[10px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">6. Windows, Glass Doors & Skylights</td>
            </tr>
            {[
               { id: 'N_S', label: 'NORTH' },
               { id: 'NE_NW', label: 'NE / NW' },
               { id: 'E_W', label: 'E / W' },
               { id: 'SE_SW', label: 'SE / SW' },
               { id: 'S', label: 'SOUTH' },
               { id: 'H', label: 'HORIZ' }
            ].map(({ id, label }) => {
               const data = room.windows[id];
               const area = typeof data === 'object' ? data.area : (data || 0);

               const shadingType = (typeof data === 'object' && data.shadingType) ? data.shadingType : (room.shadingType || 'No shades');
               const windowConfig = (typeof data === 'object') ? data : projectState.globalWindowConfig || {};
               const lookup = lookupGlazingData(windowConfig);

               const hg_factor = factors.windows.hgFactor[id] || 0;
               const loss = Math.round(area * factors.windows.hlFactor);
               const gain = Math.round(area * hg_factor);

               return (
                <tr key={id} className="border-b border-gray-200 text-[10px]">
                    <td className="p-2 border-r font-bold uppercase">{label}</td>
                    <td className="p-2 border-r text-center text-blue-600 font-bold">{id}</td>
                    <td className="p-1 border-r text-right font-mono bg-green-100">
                        <input
                            type="number" className="w-full bg-transparent text-right font-mono font-bold outline-none"
                            value={area || ''}
                            onChange={(e) => handleWindowChange(id, 'area', e.target.value)}
                        />
                    </td>
                    <td className="p-2 border-r text-right text-red-700 font-bold italic opacity-60">{factors.windows.hlFactor.toFixed(3)}</td>
                    <td className={`p-2 border-r text-right font-black ${loss > 0 ? 'bg-red-50 text-red-600' : 'text-red-600'}`}>{loss}</td>
                    <td className="p-2 border-r text-right text-blue-700 font-bold italic opacity-60">{hg_factor.toFixed(3)}</td>
                    <td className={`p-2 text-right font-black ${gain > 0 ? 'bg-blue-50 text-blue-600' : 'text-blue-600'}`}>{gain}</td>
                </tr>
               );
            })}

            {/* 7. EXPOSED FLOORS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2 flex justify-between items-center">
                <span>7. Exposed Floors</span>
                <label className="flex items-center gap-2 cursor-pointer normal-case">
                  <input
                    type="checkbox" className="w-3 h-3"
                    checked={room.hasExposedFloor !== undefined ? room.hasExposedFloor : projectState.designMultipliers.includeExposedFloor}
                    onChange={(e) => updateRoom({ hasExposedFloor: e.target.checked })}
                  />
                  <span className="text-[8px]">Include in Load</span>
                </label>
              </td>
            </tr>
            {(room.hasExposedFloor !== undefined ? room.hasExposedFloor : projectState.designMultipliers.includeExposedFloor) ? (
              <Row
                label="Exposed Floor" struct="EXF" area={areas.floorArea.toFixed(1)}
                hlFactor={factors.floor.hlFactor.toFixed(3)}
                loss={Math.round(areas.floorArea * factors.floor.hlFactor)}
                hgFactor={factors.floor.hgFactor.toFixed(3)}
                gain={Math.round(areas.floorArea * factors.floor.hgFactor)}
              />
            ) : (
              <Row label="Exposed Floor" struct="EXF" area="0.0" hlFactor="---" loss="0" hgFactor="---" gain="0" />
            )}

            {/* 8. CUSTOM COMPONENTS */}
            {projectState.compliance.customComponents.length > 0 && (
                <>
                  <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
                    <td colSpan="7" className="p-1 px-2">8. Custom Components</td>
                  </tr>
                  {projectState.compliance.customComponents.map((comp, idx) => {
                    const area = room.customComponentAreas?.[idx] || 0;
                    const hlFactor = (projectState.environmental.hl_idt - projectState.environmental.hl_odt) / comp.rValue;
                    const hgFactor = ( (projectState.environmental.hg_odt - projectState.environmental.hg_idt) + (comp.sc || 0) ) / comp.rValue;

                    return (
                        <tr key={idx} className="border-b border-gray-200 text-xs">
                           <td className="p-2 border-r font-bold">{comp.label}</td>
                           <td className="p-2 border-r text-center text-blue-600 font-bold">{comp.structure}</td>
                           <td className="p-2 border-r text-right font-mono bg-green-50">
                             <input
                               type="number"
                               className="w-16 bg-transparent text-right font-mono font-bold outline-none"
                               value={area}
                               onChange={(e) => {
                                 const customComponentAreas = { ...room.customComponentAreas, [idx]: parseFloat(e.target.value) || 0 };
                                 updateRoom({ customComponentAreas });
                               }}
                             />
                           </td>
                           <td className="p-2 border-r text-right text-red-700 font-bold italic opacity-60">{hlFactor.toFixed(3)}</td>
                           <td className={`p-2 border-r text-right font-black ${Math.round(area * hlFactor) > 0 ? 'bg-red-50 text-red-600' : 'text-red-600'}`}>{Math.round(area * hlFactor)}</td>
                           <td className="p-2 border-r text-right text-blue-700 font-bold italic opacity-60">{hgFactor.toFixed(3)}</td>
                           <td className={`p-2 text-right font-black ${Math.round(area * hgFactor) > 0 ? 'bg-blue-50 text-blue-600' : 'text-blue-600'}`}>{Math.round(area * hgFactor)}</td>
                        </tr>
                    );
                  })}
                </>
            )}

            {/* TOTALS */}
            <tr className="bg-gray-100 text-black font-black text-sm uppercase">
                <td colSpan="5" className="p-3 text-right">Room Total Load (Conductive + Air Leakage + Duct Loss)</td>
                <td className="p-3 text-right bg-red-900">{metrics.totalRoomLoss}</td>
                <td className="p-3 text-right bg-blue-900">{metrics.totalRoomGain}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="text-xs font-black uppercase text-gray-500 mb-4">Internal Loads & Overrides</h4>
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold bg-white p-2 rounded border">
                    <input
                      type="checkbox" className="w-4 h-4 text-green-600 rounded"
                      checked={room.hasDuctLoss !== false}
                      onChange={(e) => updateRoom({ hasDuctLoss: e.target.checked })}
                    />
                    Apply Duct Loss ({projectState.designMultipliers.ductLossPercentage}%)
                </label>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-xs font-bold text-gray-600">Occupancy:</span>
                    <input
                        type="number" className="w-16 border rounded p-1 font-black text-center outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        value={room.occupancy || 0}
                        onChange={(e) => updateRoom({ occupancy: parseInt(e.target.value) || 0 })}
                    />
                </div>
                {(room.level?.includes('Level 1')) && (
                  <div className="col-span-2 flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                      <span className="text-xs font-bold text-gray-600">Foundation Loss (Watts):</span>
                      <div className="flex items-center gap-4">
                        <input
                            type="number" className="w-20 border rounded p-1 font-black text-center outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            value={room.foundationLossWatts || 0}
                            onChange={(e) => updateRoom({ foundationLossWatts: parseFloat(e.target.value) || 0 })}
                        />
                        <div className="text-right leading-none">
                            <span className="text-[10px] uppercase text-gray-400 block">BTU/H</span>
                            <span className="text-sm font-black text-gray-900">{Math.round((room.foundationLossWatts || 0) * 3.412)}</span>
                        </div>
                      </div>
                  </div>
                )}
            </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between h-fit self-start">
            <div className="text-[10px] font-black uppercase text-blue-800">Air Leakage (Sec 12)</div>
            <div className="flex gap-4 font-mono font-black text-blue-900">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] opacity-50">LOSS</span>
                    <span>{metrics.airLeakageLoss}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] opacity-50">GAIN</span>
                    <span>{metrics.airLeakageGain}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2;
