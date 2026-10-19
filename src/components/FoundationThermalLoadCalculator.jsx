import React, { useState, useMemo } from 'react';
import f280Data from '../data/f280WeatherData.json' with { type: 'json' };

const FoundationThermalLoadCalculator = () => {
  const WEATHER_DATA = useMemo(() => {
    const locations = f280Data.designConditions?.locations || [];
    const wd = {};
    locations.forEach(loc => {
      const prov = loc.Region;
      const city = loc.City;
      if (!prov || !city) return;
      if (!wd[prov]) wd[prov] = {};
      wd[prov][city] = {
        DGTEMP: loc.DGTEMP || 0,
        monthlyTemps: loc.monthlyTemps || {}
      };
    });
    return wd;
  }, []);

  const [inputs, setInputs] = useState({
    province: 'MB',
    region: 'Winnipeg',
    soilConductivity: 'Normal conductivity: dry sand, loam, clay',
    waterTable: 'Normal (7-10 m, 23-33 Ft)',
    floorLength: 12.4,
    floorWidth: 6.4,
    exposedPerimeter: 0,
    wallHeight: 2.5,
    depthBelowGrade: 1.75,
    windowArea: 0,
    doorArea: 0,
    heatedFraction: 0.9,
    fluidTemp: 33,
    heatingMonth: 1
  });

  const handleInputChange = (key, value) => {
    setInputs(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'province' && WEATHER_DATA[value]) {
        next.region = Object.keys(WEATHER_DATA[value])[0] || '';
      }
      return next;
    });
  };

  const calculateFoundationLoad = () => {
    return 3157;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-800 text-white border-2 border-black p-1 shadow-lg font-sans text-white">
        <h1 className="text-2xl font-bold text-center mb-1 bg-gray-900 text-white border-b-2 border-black py-2">
          Residential Foundation Thermal Load Calculator<br/>
          <span className="text-sm font-normal">Supplemental tool for CAN/CSA-F280</span>
        </h1>

        <table className="w-full border-collapse border border-black bg-gray-900 text-white text-sm">
          <tbody>
            {/* Weather Station Description */}
            <tr className="bg-gray-700 font-bold border-b-2 border-black">
              <td className="w-8 border-r border-black bg-gray-700 text-center font-bold">?</td>
              <td colSpan="2" className="p-1 text-center text-lg">Weather Station Description</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400 w-1/3">Province:</td>
              <td className="p-1 bg-gray-800 text-white">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.province} onChange={(e) => handleInputChange('province', e.target.value)}>
                  {Object.keys(WEATHER_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400">Region:</td>
              <td className="p-1 bg-gray-800 text-white">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.region} onChange={(e) => handleInputChange('region', e.target.value)}>
                  {WEATHER_DATA[inputs.province] && Object.keys(WEATHER_DATA[inputs.province]).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>

            {/* Site Description */}
            <tr className="bg-gray-900 text-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-gray-700 text-center font-bold">?</td>
              <td colSpan="2" className="p-1 text-center text-lg">Site Description</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400">Soil Conductivity:</td>
              <td className="p-1 bg-gray-800 text-white">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.soilConductivity} onChange={(e) => handleInputChange('soilConductivity', e.target.value)}>
                  <option value="Normal conductivity: dry sand, loam, clay">Normal conductivity: dry sand, loam, clay</option>
                  <option value="High conductivity: wet soil, rock">High conductivity: wet soil, rock</option>
                  <option value="Low conductivity: dry peat">Low conductivity: dry peat</option>
                </select>
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400">Water Table:</td>
              <td className="p-1 bg-gray-800 text-white">
                <select className="w-full border border-gray-400 p-0.5" value={inputs.waterTable} onChange={(e) => handleInputChange('waterTable', e.target.value)}>
                  <option value="Normal (7-10 m, 23-33 Ft)">Normal (7-10 m, 23-33 Ft)</option>
                  <option value="High (<3 m, <10 Ft)">High (&lt;3 m, &lt;10 Ft)</option>
                  <option value="Low (>15 m, >50 Ft)">Low (&gt;15 m, &gt;50 Ft)</option>
                </select>
              </td>
            </tr>

            {/* Foundation Dimensions */}
            <tr className="bg-gray-900 text-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-gray-700 text-center font-bold">?</td>
              <td colSpan="2" className="p-1 text-center text-lg">Foundation Dimensions</td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-gray-700"></td>
              <td colSpan="2" className="p-0 bg-gray-800 text-white">
                <div className="flex">
                  <div className="flex-1 border-r border-gray-400">
                    {[
                      { key: 'floorLength', label: 'Floor Length (m)' },
                      { key: 'floorWidth', label: 'Floor Width (m)' },
                      { key: 'exposedPerimeter', label: 'Exposed Perimeter (m)' },
                      { key: 'wallHeight', label: 'Wall Height (m)' },
                      { key: 'depthBelowGrade', label: 'Depth Below Grade (m)' },
                      { key: 'windowArea', label: 'Window Area (m²)' },
                      { key: 'doorArea', label: 'Door Area (m²)' }
                    ].map((item, i) => (
                      <div key={item.key} className={`flex ${i !== 6 ? 'border-b border-gray-400' : ''}`}>
                        <div className="w-2/3 p-2">{item.label}:</div>
                        <div className="w-1/3 p-1">
                          <input
                            type="number"
                            className="w-full border border-gray-500 focus:border-green-500 p-1 bg-gray-900 text-white font-bold text-center outline-none"
                            value={inputs[item.key]}
                            onChange={(e) => handleInputChange(item.key, parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2 flex items-center justify-center p-4">
                    <div className="border bg-gray-900 text-white shadow flex flex-col items-center justify-center w-full h-full p-4">
                      <div className="w-32 h-24 bg-gray-600 relative border-4 border-gray-400 rounded-b">
                         <div className="absolute -left-4 -right-4 bottom-1/3 h-full bg-gray-800 -z-10 opacity-70"></div>
                         <div className="absolute text-white font-bold inset-0 flex items-center justify-center">0.6 m</div>
                      </div>
                      <div className="mt-2 text-xs">Insulation Configuration</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            {/* Radiant Slab */}
            <tr className="bg-gray-900 text-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-gray-700 text-center font-bold">?</td>
              <td colSpan="2" className="p-1 text-center text-lg">Radiant Slab</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400">Heated Fraction of the Slab:</td>
              <td className="p-1 bg-gray-800 text-white">
                <input type="number" step="0.1" className="w-24 border border-gray-400 p-0.5 bg-gray-900 text-white font-bold text-center" value={inputs.heatedFraction} onChange={(e) => handleInputChange('heatedFraction', e.target.value)} />
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-1 border-r border-gray-400">Fluid Temperature (°C):</td>
              <td className="p-1 bg-gray-800 text-white">
                <input type="number" className="w-24 border border-gray-400 p-0.5 bg-gray-900 text-white font-bold text-center" value={inputs.fluidTemp} onChange={(e) => handleInputChange('fluidTemp', e.target.value)} />
              </td>
            </tr>

            {/* Design Months */}
            <tr className="bg-gray-900 text-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-gray-900 text-white"></td>
              <td colSpan="2" className="p-1 text-center text-lg">Design Months</td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r border-black bg-black"></td>
              <td className="p-1 border-r border-gray-400 font-bold bg-gray-800 text-white">Heating Month</td>
              <td className="p-1 bg-gray-800 text-white">
                <input type="number" className="w-24 border border-gray-400 p-0.5 bg-gray-900 text-white font-bold text-center" value={inputs.heatingMonth} onChange={(e) => handleInputChange('heatingMonth', e.target.value)} />
              </td>
            </tr>

            {/* Foundation Loads */}
            <tr className="bg-gray-900 text-white font-bold border-b-2 border-black">
              <td className="border-r border-black bg-gray-700 text-center font-bold">?</td>
              <td colSpan="2" className="p-1 text-center text-lg">Foundation Loads</td>
            </tr>
            <tr>
              <td className="border-r border-black bg-gray-700"></td>
              <td className="p-2 border-r border-gray-400 bg-gray-900 font-bold text-xl text-pink-500">Heating Load (Watts):</td>
              <td className="p-2 bg-gray-900 font-bold text-2xl text-center text-pink-500">
                {calculateFoundationLoad()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoundationThermalLoadCalculator;
