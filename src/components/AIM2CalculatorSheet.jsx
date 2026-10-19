import React, { useState, useMemo } from 'react';
import library from '../data/library.json' with { type: 'json' };
import f280Data from '../data/f280WeatherData.json' with { type: 'json' };
import {
  TERRAIN_ROUGHNESS,
  LOCAL_SHIELDING,
  AIR_TIGHTNESS_TYPES,
  LEAKAGE_DISTRIBUTION
} from '../data/aim2Data';

const AIM2CalculatorSheet = () => {

  // Generate WEATHER_DATA dynamically from library.json
  const WEATHER_DATA = useMemo(() => {
    const locations = f280Data.designConditions?.locations || [];
    const wd = {};
    locations.forEach(loc => {
      const prov = loc.Region;
      const city = loc.City;
      if (!prov || !city) return;
      if (!wd[prov]) wd[prov] = {};
      wd[prov][city] = {
        HDD: loc.DegDay || 0,
        DHDBT: loc.DHDBT || 0,
        DHWBT: loc.DCDBT || 0,
        JanWind: loc.JanWind ?? 15.0,
        JulWind: loc.JulWind ?? 15.0
      };
    });
    return wd;
  }, []);

  const [inputs, setInputs] = useState({
    province: 'ON',
    region: 'Toronto (city hall)',
    wsLocation: 'Open flat terrain, grass',
    hAnem: 10,
    bldgSite: 'City centre',
    wallsShielding: 'No local shielding',
    flueShielding: 'Light local shielding',
    hCeiling: 9.1,
    bldgType: 'Semi-Detached',
    stories: 'Three',
    foundation: 'Slab-on-Grade',
    volume: 545,
    tightnessType: 'Present (1961-) (ACH=3.57)',
    customEla: 689.477,
    customAch: 3.57,
    mechSupply: 50,
    mechExhaust: 50,
    flue1: 50,
    flue2: 0,
    flue3: 0,
    flue4: 0
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'province') {
        const firstRegion = Object.keys(WEATHER_DATA[value])[0];
        next.region = firstRegion;
      }
      return next;
    });
  };

  const results = useMemo(() => {
    // 1. Weather & Geometry Setup
    const cityData = WEATHER_DATA[inputs.province]?.[inputs.region];
    if (!cityData) return null;

    const H = parseFloat(inputs.hCeiling) || 0.1;
    const V = parseFloat(inputs.volume) || 1;
    const tightnessType = inputs.tightnessType;

    const Tin_heat_C = 21.0;
    const Tin_heat_K = Tin_heat_C + 273.15;
    const Tin_cool_C = 24.0;
    const Tin_cool_K = Tin_cool_C + 273.15;

    const delta_T_H = Tin_heat_C - (cityData.DHDBT || 0);
    const delta_T_C = Math.abs((cityData.DCDBT || 0) - Tin_cool_C); // Absolute value for stack effect

    const V_wind_H = (cityData.JanWind || 0) / 3.6;
    const V_wind_C = (cityData.JulWind || 0) / 3.6;

    // ELA Calculation (same as before for ELA10 in cm^2)
    const rho_ref = 352.981 / (273.15 + 20); // 1.204097
    const C_orifice = 0.611;
    const Pref = 10;
    let n, ach50, ela10;

    if (tightnessType !== "Custom - BDT values") {
      const tightData = AIR_TIGHTNESS_TYPES[tightnessType];
      n = tightData.n;
      ach50 = tightData.ach50;
      ela10 = 10000 * (tightData.cNorm * V * Math.pow(Pref, n - 0.5)) / (C_orifice * Math.sqrt(2 / rho_ref));
    } else {
      ach50 = parseFloat(inputs.customAch) || 1;
      ela10 = parseFloat(inputs.customEla) || 1;
      n = Math.log((ach50 * V / 3600) / (C_orifice * (ela10 / 10000) * Math.sqrt(2 * Pref / rho_ref))) / Math.log(50 / Pref);
    }

    // 2. Stack Factor (f_s)
    const f_s_H = 0.000145 * Math.pow((H * 9.81) / Tin_heat_K, 0.5);
    const f_s_C = 0.000145 * Math.pow((H * 9.81) / Tin_cool_K, 0.5);

    const Q_stack_H = f_s_H * ela10 * Math.sqrt(delta_T_H) * 1000;
    const Q_stack_C = f_s_C * ela10 * Math.sqrt(delta_T_C) * 1000;

    // 3. Wind Factor (f_w)
    // For "City centre", the Shelter Factor (S_w) must be 0.32 (Do not use 1.0)
    let S_w = 1.0;
    if (inputs.bldgSite === "City centre") {
        S_w = 0.32;
    }
    const f_w = 0.000185 * S_w;

    const Q_wind_H = f_w * ela10 * V_wind_H * 1000;
    const Q_wind_C = f_w * ela10 * V_wind_C * 1000;

    // 4. Flue Draft (Q_flue)
    let A_flue_m2 = 0;
    const flues = [
      parseFloat(inputs.flue1) || 0,
      parseFloat(inputs.flue2) || 0,
      parseFloat(inputs.flue3) || 0,
      parseFloat(inputs.flue4) || 0
    ];
    flues.forEach(d => {
      if (d > 0) A_flue_m2 += Math.PI * Math.pow(d / 2000, 2);
    });

    const Q_flue = 120 * A_flue_m2 * Math.sqrt(delta_T_H); // Heating only

    // 5. Quadrature Combination (Natural Leakage in L/s)
    const Q_nat_H = Math.sqrt(Math.pow(Q_stack_H, 2) + Math.pow(Q_wind_H, 2)) + (0.5 * Q_flue);
    const Q_nat_C = Math.sqrt(Math.pow(Q_stack_C, 2) + Math.pow(Q_wind_C, 2));

    // 6. Final Conversion to ACH
    const heatingACH = (Q_nat_H * 3.6) / V;
    const coolingACH = (Q_nat_C * 3.6) / V;

    return {
      heatingACH,
      coolingACH,
      ela10,
      ach50
    };
  }, [inputs]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-[#e2e8f0] border-2 border-black p-1 shadow-lg font-sans">
        <h1 className="text-2xl font-bold text-center mb-1 bg-white border-b-2 border-black py-2">
          Envelope Air Leakage Calculator<br/>
          <span className="text-sm font-normal">Supplemental tool for CAN/CSA-F280</span>
        </h1>

        <table className="w-full border-collapse border border-black bg-white text-sm">
          <tbody>
            {/* Weather Station Description */}
            <tr className="bg-gray-300 font-bold border-b-2 border-black">
              <td className="w-8 border-r border-black"></td>
              <td colSpan="2" className="p-1 text-center">Weather Station Description</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd] text-center font-bold">?</td>
              <td className="p-1 border-r border-gray-400">Province:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.province} onChange={(e) => handleInputChange('province', e.target.value)}>
                  {Object.keys(WEATHER_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Region:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.region} onChange={(e) => handleInputChange('region', e.target.value)}>
                  {WEATHER_DATA[inputs.province] && Object.keys(WEATHER_DATA[inputs.province]).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Weather Station Location:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5 text-gray-500" disabled value={inputs.wsLocation}>
                  <option value="Open flat terrain, grass">Open flat terrain, grass</option>
                </select>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Anemometer height (m):</td>
              <td className="p-1 bg-[#e2e8f0]">
                <input type="number" className="w-24 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center"
                  value={inputs.hAnem} onChange={(e) => handleInputChange('hAnem', e.target.value)} />
              </td>
            </tr>

            {/* Local Shielding */}
            <tr className="bg-gray-300 font-bold border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td colSpan="2" className="p-1 text-center">Local Shielding</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd] text-center font-bold">?</td>
              <td className="p-1 border-r border-gray-400">Building Site:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.bldgSite} onChange={(e) => handleInputChange('bldgSite', e.target.value)}>
                  {Object.keys(TERRAIN_ROUGHNESS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Walls:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.wallsShielding} onChange={(e) => handleInputChange('wallsShielding', e.target.value)}>
                  {Object.keys(LOCAL_SHIELDING).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Flue:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.flueShielding} onChange={(e) => handleInputChange('flueShielding', e.target.value)}>
                  {Object.keys(LOCAL_SHIELDING).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Highest Ceiling Height (m):</td>
              <td className="p-1 bg-[#e2e8f0]">
                <input type="number" step="0.1" className="w-24 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center"
                  value={inputs.hCeiling} onChange={(e) => handleInputChange('hCeiling', e.target.value)} />
              </td>
            </tr>

            {/* Building Configuration */}
            <tr className="bg-gray-300 font-bold border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td colSpan="2" className="p-1 text-center">Building Configuration</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd] text-center font-bold">?</td>
              <td className="p-1 border-r border-gray-400">Type:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.bldgType} onChange={(e) => handleInputChange('bldgType', e.target.value)}>
                  <option value="Detached">Detached</option>
                  <option value="Semi-Detached">Semi-Detached</option>
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Number of Stories:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.stories} onChange={(e) => handleInputChange('stories', e.target.value)}>
                  <option value="One">One</option>
                  <option value="One & Half">One & Half</option>
                  <option value="Two">Two</option>
                  <option value="Two & Half">Two & Half</option>
                  <option value="Three">Three</option>
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Foundation:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.foundation} onChange={(e) => handleInputChange('foundation', e.target.value)}>
                  <option value="Crawl Space">Crawl Space</option>
                  <option value="Slab-on-Grade">Slab-on-Grade</option>
                  <option value="Shallow">Shallow</option>
                  <option value="Full">Full</option>
                </select>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">House Volume (m³):</td>
              <td className="p-1 bg-[#e2e8f0]">
                <input type="number" className="w-24 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center"
                  value={inputs.volume} onChange={(e) => handleInputChange('volume', e.target.value)} />
              </td>
            </tr>

            {/* Air Leakage / Ventilation */}
            <tr className="bg-gray-300 font-bold border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td colSpan="2" className="p-1 text-center">Air Leakage / Ventilation</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd] text-center font-bold">?</td>
              <td className="p-1 border-r border-gray-400">Air Tightness Type:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.tightnessType} onChange={(e) => handleInputChange('tightnessType', e.target.value)}>
                  {Object.keys(AIR_TIGHTNESS_TYPES).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400 align-top">Custom BDT Data:</td>
              <td className="p-1 bg-[#e2e8f0]">
                <div className="flex gap-2 items-center mb-1">
                  <select className="border border-gray-400 p-0.5 text-gray-500 bg-gray-100" disabled><option>ELA @ 10 Pa.</option></select>
                  <input type="number" step="0.001" className={`w-24 border border-gray-400 p-0.5 ${inputs.tightnessType === "Custom - BDT values" ? "bg-[#fef08a] text-red-600" : "bg-white text-black"} font-bold text-center`}
                    value={inputs.tightnessType === "Custom - BDT values" ? inputs.customEla : results?.ela10?.toFixed(3)} onChange={(e) => handleInputChange('customEla', e.target.value)} disabled={inputs.tightnessType !== "Custom - BDT values"} />
                  <span>cm²</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="number" step="0.01" className={`w-24 border border-gray-400 p-0.5 ${inputs.tightnessType === "Custom - BDT values" ? "bg-[#fef08a] text-red-600" : "bg-white text-black"} font-bold text-center`}
                    value={inputs.tightnessType === "Custom - BDT values" ? inputs.customAch : results?.ach50?.toFixed(2)} onChange={(e) => handleInputChange('customAch', e.target.value)} disabled={inputs.tightnessType !== "Custom - BDT values"} />
                  <span>ACH @ 50 Pa</span>
                </div>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Mechanical Ventilation (L/s):</td>
              <td className="p-1 bg-[#e2e8f0]">
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs font-bold mb-1">Total Supply:</div>
                    <input type="number" className="w-24 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.mechSupply} onChange={(e) => handleInputChange('mechSupply', e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs font-bold mb-1">Total Exhaust:</div>
                    <input type="number" className="w-24 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.mechExhaust} onChange={(e) => handleInputChange('mechExhaust', e.target.value)} />
                  </div>
                </div>
              </td>
            </tr>

            {/* Flue Size */}
            <tr className="bg-gray-300 font-bold border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td colSpan="2" className="p-1 text-center">Flue Size</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Flue #:</td>
              <td className="p-1 bg-[#e2e8f0] flex gap-2 font-bold justify-between px-6">
                <span>#1</span><span>#2</span><span>#3</span><span>#4</span>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td className="p-1 border-r border-gray-400">Diameter (mm):</td>
              <td className="p-1 bg-[#e2e8f0] flex gap-2">
                <input type="number" className="w-16 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.flue1} onChange={(e) => handleInputChange('flue1', e.target.value)} />
                <input type="number" className="w-16 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.flue2} onChange={(e) => handleInputChange('flue2', e.target.value)} />
                <input type="number" className="w-16 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.flue3} onChange={(e) => handleInputChange('flue3', e.target.value)} />
                <input type="number" className="w-16 border border-gray-400 p-0.5 bg-[#fef08a] text-red-600 font-bold text-center" value={inputs.flue4} onChange={(e) => handleInputChange('flue4', e.target.value)} />
              </td>
            </tr>

            {/* Output */}
            <tr className="bg-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-[#93c5fd]"></td>
              <td colSpan="2" className="p-2 text-center text-lg">Envelope Air Leakage Rate</td>
            </tr>
            <tr className="bg-[#fca5a5] border-b-2 border-black text-black">
              <td className="border-r border-black bg-[#93c5fd] text-center font-bold">?</td>
              <td className="p-2 border-r border-gray-400 text-lg font-bold">Heating Air Leakage Rate (ACH):</td>
              <td className="p-2 text-center text-2xl font-bold">
                {results?.heatingACH !== undefined ? results.heatingACH.toFixed(3) : "ERR"}
              </td>
            </tr>
            <tr className="bg-[#cffafe] border-b-2 border-black text-black">
              <td className="border-r border-black bg-black"></td>
              <td className="p-2 border-r border-gray-400 text-lg font-bold">Cooling Air Leakage Rate (ACH):</td>
              <td className="p-2 text-center text-2xl font-bold">
                {results?.coolingACH !== undefined ? results.coolingACH.toFixed(3) : "ERR"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIM2CalculatorSheet;
