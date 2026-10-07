import React, { useState, useMemo } from 'react';
import library from '../data/library.json';

const LibraryPage = () => {
  const [provinceFilter, setProvinceFilter] = useState('');

  const provinces = useMemo(() => {
    const pSet = new Set(library.designConditions.locations.map(l => l.province));
    return Array.from(pSet).sort();
  }, []);

  const filteredLocations = useMemo(() => {
    if (!provinceFilter) return library.designConditions.locations;
    return library.designConditions.locations.filter(l => l.province === provinceFilter);
  }, [provinceFilter]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 space-y-12 bg-white min-h-screen border border-gray-200 shadow-2xl rounded-2xl">
      <div className="text-center border-b-4 border-gray-200 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Engineering Reference Library</h1>
        <p className="text-[10px] font-black text-blue-500 mt-2 tracking-widest uppercase">HRAI / CSA F280-12 STANDARDS DATA</p>
      </div>

      {/* 1. Design Conditions (Weather Data) */}
      <section>
        <div className="flex justify-between items-end mb-4 bg-gray-100 p-4 rounded-t-xl border-x border-t border-gray-300">
           <h2 className="text-xl font-black uppercase text-gray-900 tracking-tighter">Table A: Outdoor Design Conditions</h2>
           <div className="flex items-center gap-4">
              <label className="mb-0 text-gray-600">Filter by Province</label>
              <select
                className="bg-white border-gray-300 text-gray-900 font-black text-xs px-4 py-2 rounded uppercase"
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <option value="">All Provinces</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
           </div>
        </div>
        <div className="overflow-x-auto border border-gray-300 rounded-b-xl max-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-[10px] font-black uppercase border-b border-gray-300 sticky top-0 z-10 text-gray-600">
              <tr>
                <th className="p-4 border-r border-gray-300">Province</th>
                <th className="p-4 border-r border-gray-300">City</th>
                <th className="p-4 border-r border-gray-300 text-center">Heating ODTH (1%)</th>
                <th className="p-4 border-r border-gray-300 text-center">Cooling ODTC (2.5%)</th>
                <th className="p-4 border-r border-gray-300 text-center">Daily Range</th>
                <th className="p-4 text-center">Latitude</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold divide-y divide-gray-800">
              {filteredLocations.map((loc, i) => (
                <tr key={i} className="hover:bg-gray-100/40 transition-colors">
                  <td className="p-4 border-r border-gray-200 text-blue-500 font-black">{loc.province}</td>
                  <td className="p-4 border-r border-gray-200 text-gray-900 font-black">{loc.cityName}</td>
                  <td className="p-4 border-r border-gray-200 text-center text-red-500 font-black">{loc.odtHeating}&deg;C</td>
                  <td className="p-4 border-r border-gray-200 text-center text-blue-500 font-black">{loc.odtCooling}&deg;C</td>
                  <td className="p-4 border-r border-gray-200 text-center text-gray-700">{loc.summerRange}&deg;C</td>
                  <td className="p-4 text-center text-gray-700">{loc.latitude}&deg;N</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SOLAR Table */}
        <section>
          <h2 className="text-xl font-black uppercase text-gray-900 tracking-tighter mb-4 border-l-4 border-orange-500 pl-4">Table B: Solar Heat Gain Factors (BTU/ft²)</h2>
          <div className="overflow-x-auto border border-gray-300 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-[10px] font-black uppercase border-b border-gray-300 text-gray-600">
                <tr>
                  <th className="p-3 border-r border-gray-300">Latitude</th>
                  <th className="p-3 border-r border-gray-300 text-center">N/S</th>
                  <th className="p-3 border-r border-gray-300 text-center">S</th>
                  <th className="p-3 border-r border-gray-300 text-center">E/W</th>
                  <th className="p-3 border-r border-gray-300 text-center">NE/NW</th>
                  <th className="p-3 border-r border-gray-300 text-center">SE/SW</th>
                  <th className="p-3 text-center">H</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-bold divide-y divide-gray-800">
                {Object.entries(library.solarTable).map(([lat, dirs]) => (
                  <tr key={lat} className="hover:bg-gray-100/40">
                    <td className="p-3 border-r border-gray-200 text-gray-900">{lat}&deg;N</td>
                    <td className="p-3 border-r border-gray-200 text-center">{dirs.N_S.imp}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{dirs.S.imp}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{dirs.E_W.imp}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{dirs.NE_NW.imp}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{dirs.SE_SW.imp}</td>
                    <td className="p-3 text-center">{dirs.H.imp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ISF Table */}
        <section>
          <h2 className="text-xl font-black uppercase text-gray-900 tracking-tighter mb-4 border-l-4 border-indigo-500 pl-4">Table C: Internal Shade Factors (ISF)</h2>
          <div className="overflow-x-auto border border-gray-300 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-[10px] font-black uppercase border-b border-gray-300 text-gray-600">
                <tr>
                  <th className="p-3 border-r border-gray-300">Shade Type</th>
                  <th className="p-3 border-r border-gray-300 text-center">Single</th>
                  <th className="p-3 border-r border-gray-300 text-center">Double</th>
                  <th className="p-3 border-r border-gray-300 text-center">Triple</th>
                  <th className="p-3 text-center">Heat Mirror</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-bold divide-y divide-gray-800">
                {Object.entries(library.isfTable).map(([type, vals]) => (
                  <tr key={type} className="hover:bg-gray-100/40">
                    <td className="p-3 border-r border-gray-200 text-gray-900">{type}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{vals.Single}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{vals.Double}</td>
                    <td className="p-3 border-r border-gray-200 text-center">{vals.Triple}</td>
                    <td className="p-3 text-center">{vals['Heat Mirror']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Assembly R-Values */}
      <section>
        <h2 className="text-xl font-black uppercase text-gray-900 tracking-tighter mb-4 border-l-4 border-green-500 pl-4">Table D: Typical Assembly U-Factors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {library.assemblies.map(asm => (
            <div key={asm.id} className="bg-gray-100/50 p-4 rounded-xl border border-gray-300 flex justify-between items-center group hover:border-green-500/50 transition-colors">
              <div>
                <div className="text-[8px] font-black text-gray-500 uppercase">{asm.type}</div>
                <div className="text-[11px] font-black text-gray-900 pr-4">{asm.description}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-gray-500 uppercase">U-Factor</div>
                <div className="text-lg font-black text-green-500">{asm.uFactor}</div>
                <div className="text-[8px] font-bold text-gray-600">R-{Math.round(1/asm.uFactor)} EFF</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-8 border-t border-gray-200 text-center text-[10px] font-black uppercase text-gray-600 tracking-widest">
        End of Engineering Library &bull; CSA F280-12 Digital Reference
      </div>
    </div>
  );
};

export default LibraryPage;
