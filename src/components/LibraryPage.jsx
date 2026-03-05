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
    <div className="max-w-7xl mx-auto py-8 px-8 space-y-12 bg-gray-900 min-h-screen border border-gray-800 shadow-2xl rounded-2xl">
      <div className="text-center border-b-4 border-gray-800 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Engineering Reference Library</h1>
        <p className="text-[10px] font-black text-blue-500 mt-2 tracking-widest uppercase">HRAI / CSA F280-12 STANDARDS DATA</p>
      </div>

      {/* 1. Design Conditions (Weather Data) */}
      <section>
        <div className="flex justify-between items-end mb-4 bg-gray-800 p-4 rounded-t-xl border-x border-t border-gray-700">
           <h2 className="text-xl font-black uppercase text-white tracking-tighter">Table A: Outdoor Design Conditions</h2>
           <div className="flex items-center gap-4">
              <label className="mb-0 text-gray-400">Filter by Province</label>
              <select
                className="bg-gray-900 border-gray-700 text-white font-black text-xs px-4 py-2 rounded uppercase"
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <option value="">All Provinces</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
           </div>
        </div>
        <div className="overflow-x-auto border border-gray-700 rounded-b-xl max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-[10px] font-black uppercase border-b border-gray-700 sticky top-0 z-10 text-gray-400">
              <tr>
                <th className="p-4 border-r border-gray-700">Province</th>
                <th className="p-4 border-r border-gray-700">City</th>
                <th className="p-4 border-r border-gray-700 text-center">Heating ODTH (1%)</th>
                <th className="p-4 border-r border-gray-700 text-center">Cooling ODTC (2.5%)</th>
                <th className="p-4 border-r border-gray-700 text-center">Daily Range</th>
                <th className="p-4 text-center">Latitude</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold divide-y divide-gray-800">
              {filteredLocations.map((loc, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-4 border-r border-gray-800 text-blue-500 font-black">{loc.province}</td>
                  <td className="p-4 border-r border-gray-800 text-white font-black">{loc.cityName}</td>
                  <td className="p-4 border-r border-gray-800 text-center text-red-500 font-black">{loc.odtHeating}&deg;C</td>
                  <td className="p-4 border-r border-gray-800 text-center text-blue-500 font-black">{loc.odtCooling}&deg;C</td>
                  <td className="p-4 border-r border-gray-800 text-center text-gray-300">{loc.summerRange}&deg;C</td>
                  <td className="p-4 text-center text-gray-300">{loc.latitude}&deg;N</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      <div className="pt-8 border-t border-gray-800 text-center text-[10px] font-black uppercase text-gray-600 tracking-widest">
        End of Engineering Library &bull; CSA F280-12 Digital Reference
      </div>
    </div>
  );
};

export default LibraryPage;
