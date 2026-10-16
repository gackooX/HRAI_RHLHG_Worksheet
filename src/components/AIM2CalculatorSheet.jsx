import React, { useState, useMemo } from 'react';
import library from '../data/library.json' with { type: 'json' };
import {
  TERRAIN_ROUGHNESS,
  LOCAL_SHIELDING,
  AIR_TIGHTNESS_TYPES,
  LEAKAGE_DISTRIBUTION
} from '../data/aim2Data';

const AIM2CalculatorSheet = () => {

  // Generate WEATHER_DATA dynamically from library.json
  const WEATHER_DATA = useMemo(() => {
    const locations = library.designConditions?.locations || [];
    const wd = {};
    locations.forEach(loc => {
      const prov = loc.province;
      const city = loc.cityName;
      if (!prov || !city) return;
      if (!wd[prov]) wd[prov] = {};
      wd[prov][city] = {
        HDD: loc.degDay || 0,
        DHDBT: loc.odtHeating || 0,
        DHWBT: loc.odtCooling || 0,
        JanWind: 15.0, // Temporary default
        JulWind: 15.0  // Temporary default
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
    // 1. Inputs
    const cityData = WEATHER_DATA[inputs.province]?.[inputs.region];
    if (!cityData) return null;

    const z0_ws = TERRAIN_ROUGHNESS[inputs.wsLocation];
    const z0_site = TERRAIN_ROUGHNESS[inputs.bldgSite];
    const Sw_o = LOCAL_SHIELDING[inputs.wallsShielding];
    const Sw_flue = LOCAL_SHIELDING[inputs.flueShielding];
    const H = parseFloat(inputs.hCeiling) || 0.1;
    const V = parseFloat(inputs.volume) || 1;
    const tightnessType = inputs.tightnessType;

    // Constants
    const Tin_heat = 22.0;
    const Tin_cool = 24.0;
    const rho_ref = 352.981 / (273.15 + 20); // 1.204097
    const C_orifice = 0.611;
    const g = 9.8;
    const Pref = 10;

    // 1. Envelope Flow Coeff
    let n, C, ach50, ela10;
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
    C = (ach50 * V) / (3600 * Math.pow(50, n));

    // 2. Flue Flow Coeff
    const Cd = 0.5;
    const Pref_flue = 4.0;
    const rho_air = 1.177;
    let A_flue = 0;
    const flues = [parseFloat(inputs.flue1)||0, parseFloat(inputs.flue2)||0, parseFloat(inputs.flue3)||0, parseFloat(inputs.flue4)||0];
    flues.forEach(d => {
      if (d > 0) A_flue += (Math.PI / 4) * Math.pow(d / 1000, 2);
    });

    const C_flue = Cd * A_flue * Math.sqrt(2 / rho_air) * Math.pow(Pref_flue, 0.5 - n);
    const C_total = C + C_flue;
    const Y = C_total === 0 ? 0 : C_flue / C_total;

    // 3. Leakage Distribution
    const leakKey = `${inputs.bldgType}|${inputs.stories}|${inputs.foundation}`;
    const leakData = LEAKAGE_DISTRIBUTION[leakKey] || { ceiling: 0.2, walls: 0.6, floor: 0.2 };
    const R = (leakData.ceiling + leakData.floor) * (1 - Y);
    const X = (leakData.ceiling - leakData.floor) * (1 - Y);
    const beta_f = (H + 1.5) / H;

    // 4. Stack & Wind Factors
    let f_s, f_w;
    const S = (1 + n * R) / (n + 1);
    const M = Math.pow(X, 2) / (2 - R);

    if (Y === 0) {
      f_s = S * Math.pow(Math.max(0, 0.5 - 0.5 * Math.pow(M, 1.25)), 1.5);
      f_w = 0.19 * (2 - n) * (1 - Math.pow((X + R) / 2, 1.5));
    } else {
      const X_c = R + (2 * (1 - R - Y)) / Math.pow(beta_f + 1, 1 / n);
      const F = n * Y * Math.pow(beta_f - 1, (3 * n - 1) / (3 * n)) * (1 - (3 * Math.pow(X_c - X, 2) * Math.pow(R, 1 - n)) / (2 * (beta_f + 1)));
      f_s = S * Math.pow(Math.max(0, 0.5 - 0.5 * Math.pow(M, 1.25)), 1.5) + F;
      f_w = 0.19 * (2 - n) * (1 - Math.pow((X + R) / 2, 1.5 - Y)) - (Y / 4) * (1 - R / 2);
    }

    // 5. Terrain & Shelter
    const h_anem = parseFloat(inputs.hAnem) || 10;
    const C_T = (Math.log(H / z0_site) / Math.log(60 / z0_site)) * (Math.log(60 / z0_ws) / Math.log(h_anem / z0_ws));
    const S_w = Sw_o * (1 - Y) + 1.5 * Sw_flue * Y;
    const Ue_heat = (cityData.JanWind / 3.6) * C_T;
    const Ue_cool = (cityData.JulWind / 3.6) * C_T;

    // 6. Final Calculation
    const calcInf = (Tin, Tout, Ue) => {
      const rho_out = 352.981 / (Tout + 273.15);
      const P_w = 0.5 * rho_out * Math.pow(S_w * Ue, 2);
      const P_s = rho_out * g * H * (Math.abs(Tin - Tout) / (Tin + 273.15));
      const Q_w = (3600 / V) * C_total * f_w * Math.pow(P_w, n);
      const Q_s = (3600 / V) * C_total * f_s * Math.pow(P_s, n);
      return Math.pow(Math.pow(Q_s, 1/n) + Math.pow(Q_w, 1/n) - (1/3) * Math.pow(Q_s * Q_w, 1/(2*n)), n);
    };

    return {
      heatingACH: calcInf(Tin_heat, cityData.DHDBT, Ue_heat),
      coolingACH: calcInf(Tin_cool, cityData.DHWBT, Ue_cool),
      ela10, ach50
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
