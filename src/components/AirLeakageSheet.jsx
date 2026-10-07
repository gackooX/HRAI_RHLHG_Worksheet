import React from 'react';
import { calculateRoomConductiveLoss, calculateRoomConductiveGain, calculateComponentFactors } from '../utils/calculations';

const AirLeakageSheet = ({ state, dispatch }) => {
  const isMetric = state.displayUnits === 'METRIC';

  // Base constants
  const B_VAL = isMetric ? 0.33 : 0.018;
  const C_VAL = isMetric ? 1.2 : 1.08;
  const HL_DELTA_T = state.environmental.hl_idt - state.environmental.hl_odt;
  const HG_DELTA_T = state.environmental.hg_odt - state.environmental.hg_idt;

  // Derived state
  const LRairh = state.externalValues.LRairh;
  const LRairc = state.externalValues.LRairc;

  const rooms = state.rooms;
  const calculatedVb = rooms.reduce((acc, room) => {
    const area = room.floorArea || 0;
    const height = room.height || state.foundation.floorHeights[room.level] || 8;
    return acc + (area * height);
  }, 0);

  const Vb = (state.ventilation.vbOverride !== null && state.ventilation.vbOverride !== undefined && state.ventilation.vbOverride !== "")
    ? Number(state.ventilation.vbOverride)
    : calculatedVb;

  // Building Air Leakage Heat Loss/Gain
  const HL_leak = B_VAL * LRairh * Vb * HL_DELTA_T;
  const HG_leak = B_VAL * LRairc * Vb * HG_DELTA_T;

  // Ventilation Heat Loss/Gain
  const PVC = state.ventilation.PVC || 0;
  const E = state.ventilation.sensibleEfficiencyE || 0;
  const ATRE = state.ventilation.totalEfficiencyATRE || 0;

  const HL_bvent = C_VAL * PVC * HL_DELTA_T * (1 - E);
  const HG_bvent = C_VAL * PVC * HG_DELTA_T * (1 - ATRE);

  // Helper for Section 11 / 10 Conductive Heat Loss/Gain
  const factors = calculateComponentFactors(state);

  const getLevelConductiveLoss = (levelNumber) => {
    // E.g. levelNumber = 1, match "Level 1" or "Basement" (if 1 is lowest)
    // Simplify matching: room.level contains string like 'Level 1'
    const levelRooms = state.rooms.filter(r => r.level && r.level.includes(`Level ${levelNumber}`) || (levelNumber === 1 && r.level === 'Basement'));
    return levelRooms.reduce((acc, room) => acc + calculateRoomConductiveLoss(room, state, factors), 0) || 1; // avoid / 0 visual
  };

  const getBuildingConductiveHeatGain = () => {
    const totalGain = state.rooms.reduce((acc, room) => acc + calculateRoomConductiveGain(room, state, factors).totalGain, 0);
    return totalGain || 1; // avoid / 0 visual
  };

  // Handlers
  const handleVentChange = (field, value) => {
    dispatch({ type: 'UPDATE_VENTILATION', payload: { [field]: value } });
  };

  const handleLevelFactorChange = (level, value) => {
    dispatch({
      type: 'UPDATE_VENTILATION',
      payload: {
        levelFactors: {
          ...state.ventilation.levelFactors,
          [level]: value
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen text-xs text-black">
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-4">
          <div>
            <h1 className="font-bold text-lg uppercase">HRAI Residential Heat Loss and Heat Gain Calculations</h1>
            <h2 className="font-semibold uppercase">Formula Sheet (For Air Leakage / Ventilation Calculation)</h2>
          </div>
          <div className="text-sm font-bold border border-black px-4 py-1">
            Page ___ of ___
          </div>
        </div>

        {/* Global Inputs Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">LRairh</label>
            <input type="number" step="0.001" className="w-full font-mono text-sm outline-none"
              value={LRairh}
              onChange={(e) => dispatch({ type: 'UPDATE_EXTERNAL', payload: { LRairh: Number(e.target.value) } })} />
          </div>
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">LRairc</label>
            <input type="number" step="0.001" className="w-full font-mono text-sm outline-none"
              value={LRairc}
              onChange={(e) => dispatch({ type: 'UPDATE_EXTERNAL', payload: { LRairc: Number(e.target.value) } })} />
          </div>
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">PVC ({isMetric?'L/s':'CFM'})</label>
            <input type="number" step="1" className="w-full font-mono text-sm outline-none"
              value={PVC}
              onChange={(e) => handleVentChange('PVC', Number(e.target.value))} />
          </div>
          <div className="border border-green-500 p-2 rounded flex flex-col justify-between">
            <label className="block text-[10px] font-bold text-gray-600">Vb ({isMetric?'m³':'ft³'}) - Override</label>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder={`Auto: ${calculatedVb.toFixed(1)}`} className="w-full font-mono text-sm outline-none border-b border-gray-300"
                value={state.ventilation.vbOverride || ''}
                onChange={(e) => handleVentChange('vbOverride', e.target.value)} />
            </div>
          </div>
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">Sensible Eff (E) 0-1</label>
            <input type="number" step="0.01" className="w-full font-mono text-sm outline-none"
              value={E}
              onChange={(e) => handleVentChange('sensibleEfficiencyE', Number(e.target.value))} />
          </div>
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">Total Eff (ATRE) 0-1</label>
            <input type="number" step="0.01" className="w-full font-mono text-sm outline-none"
              value={ATRE}
              onChange={(e) => handleVentChange('totalEfficiencyATRE', Number(e.target.value))} />
          </div>
          <div className="border border-green-500 p-2 rounded">
            <label className="block text-[10px] font-bold text-gray-600">Ventilation Case</label>
            <select className="w-full font-mono text-sm outline-none"
              value={state.ventilation.systemCase}
              onChange={(e) => handleVentChange('systemCase', e.target.value)}>
              <option value="Case #1">Case #1: Exhaust Only</option>
              <option value="Case #2">Case #2: Direct Ducted</option>
              <option value="Case #3">Case #3: Central Forced Air</option>
            </select>
          </div>
        </div>

        {/* Section 1: Air Leakage */}
        <div className="grid grid-cols-2 border-2 border-black mb-2">
          {/* Heat Loss */}
          <div className="border-r-2 border-black p-2 text-red-600">
            <div className="text-center font-bold border-b border-black pb-1 mb-2">BUILDING AIR LEAKAGE HEAT LOSS</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">B (M) = 0.33<br/>B (I) = 0.018</div>
            <div className="font-mono flex items-center gap-2 mb-4">
              HL<sub className="text-[8px]">leak</sub> = B × LR<sub className="text-[8px]">airh</sub> × Vb × HLΔT
            </div>
            <div className="font-mono flex items-center gap-2">
              = {B_VAL} × {LRairh} × {Vb.toFixed(1)} × {HL_DELTA_T.toFixed(1)} =
              <span className="border border-black px-2 py-1 min-w-[60px] text-center inline-block">{HL_leak.toFixed(0)}</span>
            </div>
          </div>
          {/* Heat Gain */}
          <div className="p-2 text-blue-600">
            <div className="text-center font-bold border-b border-black pb-1 mb-2">BUILDING AIR LEAKAGE HEAT GAIN</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">B (M) = 0.33<br/>B (I) = 0.018</div>
            <div className="font-mono flex items-center gap-2 mb-4">
              HG<sub className="text-[8px]">leak</sub> = B × LR<sub className="text-[8px]">airc</sub> × Vb × HGΔT
            </div>
            <div className="font-mono flex items-center gap-2">
              = {B_VAL} × {LRairc} × {Vb.toFixed(1)} × {HG_DELTA_T.toFixed(1)} =
              <span className="border border-black px-2 py-1 min-w-[60px] text-center inline-block">{HG_leak.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Section 11: Multiplier Table */}
        <div className="border-2 border-black mb-2 text-red-600">
          <div className="text-center font-bold border-b-2 border-black p-1 text-black">AIR LEAKAGE HEAT LOSS/GAIN MULTIPLIER TABLE (SECTION 11)</div>
          <table className="w-full text-center border-b-2 border-black">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-1">Level</th>
                <th className="border-r border-black p-1">Level Factor<br/>(LF)</th>
                <th className="border-r border-black p-1">Building Air<br/>Leakage Heat Loss<br/>(HL<sub className="text-[8px]">leak</sub>)</th>
                <th className="border-r border-black p-1">Level Conductive Heat<br/>Loss: see Section 10<br/>(HL<sub className="text-[8px]">clevel</sub>)</th>
                <th className="p-1">Air Leakage Heat Loss<br/>Multiplier<br/>(LF × HL<sub className="text-[8px]">leak</sub> ÷ HL<sub className="text-[8px]">clevel</sub>)</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map(level => {
                const LF = state.ventilation.levelFactors[level] || 0;
                const HLc = getLevelConductiveLoss(level) || 1; // avoid / 0 visual
                const mult = (LF * HL_leak) / HLc;
                return (
                  <tr key={level} className="border-b border-black last:border-b-0">
                    <td className="border-r border-black p-1 font-bold">{level}</td>
                    <td className="border-r border-black p-1">
                      <input type="number" step="0.1" className="w-16 text-center border border-green-500 outline-none"
                        value={LF} onChange={(e) => handleLevelFactorChange(level, Number(e.target.value))} />
                    </td>
                    <td className="border-r border-black p-1">{HL_leak.toFixed(0)}</td>
                    <td className="border-r border-black p-1">{HLc.toFixed(0)}</td>
                    <td className="p-1">{mult.toFixed(3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="p-2 flex items-center gap-2 text-blue-600 font-bold border-t border-black">
            <span>Air Leakage Heat Gain Multiplier =</span>
            <div className="flex flex-col items-center mx-2">
              <span className="border-b border-black px-4">HG<sub className="text-[8px]">leak</sub></span>
              <span>Building Conductive Heat Gain</span>
            </div>
            <span>=</span>
            <span className="border border-black px-4 py-1 inline-block min-w-[80px] text-center">
              {(HG_leak / getBuildingConductiveHeatGain()).toFixed(3)}
            </span>
          </div>
        </div>

        {/* Section 2: Ventilation */}
        <div className="grid grid-cols-2 border-2 border-black mb-2">
          {/* Heat Loss */}
          <div className="border-r-2 border-black p-2 text-red-600">
            <div className="text-center font-bold border-b border-black pb-1 mb-2">VENTILATION HEAT LOSS</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">C (M) = 1.2<br/>C (I) = 1.08</div>
            <div className="font-mono flex items-center gap-2 mb-4">
              HL<sub className="text-[8px]">bvent</sub> = C × PVC × HLΔT × (1 - E)
            </div>
            <div className="font-mono flex items-center gap-2">
              = {C_VAL} × {PVC} × {HL_DELTA_T.toFixed(1)} × (1 - {E}) =
              <span className="border border-black px-2 py-1 min-w-[60px] text-center inline-block">{HL_bvent.toFixed(0)}</span>
            </div>
          </div>
          {/* Heat Gain */}
          <div className="p-2 text-blue-600">
            <div className="text-center font-bold border-b border-black pb-1 mb-2">VENTILATION HEAT GAIN</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">C (M) = 1.2<br/>C (I) = 1.08</div>
            <div className="font-mono flex items-center gap-2 mb-4">
              HG<sub className="text-[8px]">bvent</sub> = C × PVC × HGΔT × (1 - ATRE)
            </div>
            <div className="font-mono flex items-center gap-2">
              = {C_VAL} × {PVC} × {HG_DELTA_T.toFixed(1)} × (1 - {ATRE}) =
              <span className="border border-black px-2 py-1 min-w-[60px] text-center inline-block">{HG_bvent.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-2 border-2 border-black">
          {/* Case 1 Loss */}
          <div className="border-r-2 border-b-2 border-black p-2 text-red-600">
            <div className="font-bold text-black mb-2">Case #1: Exhaust Only System (Section 12a)</div>
            <div className="mb-2">Multiplier = Level Factor × HL<sub className="text-[8px]">bvent</sub> ÷ Level Cond. Heat Loss</div>
            <table className="w-full text-center border border-black mb-2 text-[10px]">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black">Level</th>
                  <th className="border-r border-black">LF</th>
                  <th className="border-r border-black">HL<sub className="text-[8px]">bvent</sub></th>
                  <th className="border-r border-black">LVL Cond. HL</th>
                  <th>Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map(l => {
                  const LF = state.ventilation.levelFactors[l] || 0;
                  const HLc = getLevelConductiveLoss(l) || 1;
                  const mult = (LF * HL_bvent) / HLc;
                  return (
                    <tr key={l} className="border-b border-black last:border-b-0">
                      <td className="border-r border-black">{l}</td>
                      <td className="border-r border-black">{LF}</td>
                      <td className="border-r border-black">{HL_bvent.toFixed(0)}</td>
                      <td className="border-r border-black">{HLc.toFixed(0)}</td>
                      <td>{mult.toFixed(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div>HL<sub className="text-[8px]">rvent</sub> = Multiplier × Room Conductive Heat Loss</div>
          </div>

          {/* Case 1 Gain */}
          <div className="border-b-2 border-black p-2 text-blue-600 flex flex-col justify-center">
            <div className="font-bold text-black mb-2">Case #1: Exhaust Only System (Section 12a)</div>
            <div className="flex items-center gap-2 mb-4 font-bold">
              <span>Multiplier =</span>
              <div className="flex flex-col items-center">
                <span className="border-b border-black px-2">HG<sub className="text-[8px]">bvent</sub></span>
                <span>Building Conductive Heat Gain</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span>Multiplier =</span>
              <span className="border-b border-black w-16 inline-block"></span>
              <span>=</span>
              <span className="border border-black px-4 py-1 min-w-[60px] text-center">
                {(HG_bvent / getBuildingConductiveHeatGain()).toFixed(3)}
              </span>
            </div>
            <div>HG<sub className="text-[8px]">rvent</sub> = Multiplier × Room Conductive Heat Gain</div>
          </div>

          {/* Case 2 Loss */}
          <div className="border-r-2 border-b-2 border-black p-2 text-red-600">
            <div className="font-bold text-black mb-2">Case #2: Direct Ducted System (Section 12b)</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">C (M) = 1.2<br/>C (I) = 1.08</div>
            <div className="mb-2">Multiplier = C × HLΔT × (1 - E)</div>
            <div className="flex items-center gap-2 mb-4">
              <span>Multiplier =</span>
              <span>{C_VAL}</span> × <span>{HL_DELTA_T.toFixed(1)}</span> × <span>(1 - {E})</span> =
              <span className="border border-black px-4 py-1 min-w-[60px] inline-block">{(C_VAL * HL_DELTA_T * (1-E)).toFixed(2)}</span>
            </div>
            <div className="ml-4">
              Q<sub className="text-[8px]">vr</sub> = Room Ventilation Rate<br/>
              HL<sub className="text-[8px]">rvent</sub> = Multiplier × Q<sub className="text-[8px]">vr</sub>
            </div>
          </div>

          {/* Case 2 Gain */}
          <div className="border-b-2 border-black p-2 text-blue-600">
            <div className="font-bold text-black mb-2">Case #2: Direct Ducted System (Section 12b)</div>
            <div className="text-[10px] text-right text-black font-bold mb-2">C (M) = 1.2<br/>C (I) = 1.08</div>
            <div className="mb-2">Multiplier = C × HGΔT × (1 - ATRE)</div>
            <div className="flex items-center gap-2 mb-4">
              <span>Multiplier =</span>
              <span>{C_VAL}</span> × <span>{HG_DELTA_T.toFixed(1)}</span> × <span>(1 - {ATRE})</span> =
              <span className="border border-black px-4 py-1 min-w-[60px] inline-block">{(C_VAL * HG_DELTA_T * (1-ATRE)).toFixed(2)}</span>
            </div>
            <div className="ml-4">
              Q<sub className="text-[8px]">vr</sub> = Room Ventilation Rate<br/>
              HG<sub className="text-[8px]">rvent</sub> = Multiplier × Q<sub className="text-[8px]">vr</sub>
            </div>
          </div>

          {/* Case 3 Loss */}
          <div className="border-r-2 border-black p-2 text-red-600">
            <div className="font-bold text-black mb-2">Case #3: Central Forced Air System (Section 19)</div>
            <div className="mt-4">Enter HL<sub className="text-[8px]">bvent</sub> in Section 19</div>
          </div>

          {/* Case 3 Gain */}
          <div className="p-2 text-blue-600">
            <div className="font-bold text-black mb-2">Case #3: Central Forced Air System (Section 22)</div>
            <div className="flex items-center gap-2 mt-4">
              <span>HG<sub className="text-[8px]">bvent</sub></span> × 1.3 =
              <span className="border border-black px-4 py-1 min-w-[60px] inline-block">{(HG_bvent * 1.3).toFixed(0)}</span>
              <span className="text-black font-bold">(enter in Section 22)</span>
            </div>
          </div>
        </div>

      </div>

      {/* LF Reference Table */}
      <div className="mt-4 w-1/3">
        <h3 className="font-bold text-sm mb-1">Level Factor Reference</h3>
        <table className="w-full text-center border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black">Level</th>
              <th className="border border-black">One storey</th>
              <th className="border border-black">Two</th>
              <th className="border border-black">Three</th>
              <th className="border border-black">Four</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black font-bold">1</td>
              <td className="border border-black">1</td>
              <td className="border border-black">0.6</td>
              <td className="border border-black">0.5</td>
              <td className="border border-black">0.4</td>
            </tr>
            <tr>
              <td className="border border-black font-bold">2</td>
              <td className="border border-black"></td>
              <td className="border border-black">0.4</td>
              <td className="border border-black">0.3</td>
              <td className="border border-black">0.3</td>
            </tr>
            <tr>
              <td className="border border-black font-bold">3</td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
              <td className="border border-black">0.2</td>
              <td className="border border-black">0.2</td>
            </tr>
            <tr>
              <td className="border border-black font-bold">4</td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
              <td className="border border-black">0.1</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AirLeakageSheet;
