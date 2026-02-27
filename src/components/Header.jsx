import React from 'react';

const Header = ({ projectData, updateProjectData, designConditions, locations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
      <div className="border border-black p-2">
        <h3 className="font-bold border-b border-black mb-2 uppercase">Project Information</h3>
        <div className="grid grid-cols-3 gap-1">
          <label className="font-semibold">Client:</label>
          <input
            className="col-span-2 border-b border-gray-300 outline-none focus:border-blue-500"
            value={projectData.clientName}
            onChange={(e) => updateProjectData('clientName', e.target.value)}
          />
          <label className="font-semibold">Address:</label>
          <input
            className="col-span-2 border-b border-gray-300 outline-none focus:border-blue-500"
            value={projectData.address}
            onChange={(e) => updateProjectData('address', e.target.value)}
          />
          <label className="font-semibold">City:</label>
          <select
            className="col-span-2 border-b border-gray-300 bg-transparent outline-none"
            value={projectData.city}
            onChange={(e) => updateProjectData('city', e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc.city} value={loc.city}>{loc.city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-black p-2">
        <h3 className="font-bold border-b border-black mb-2 uppercase">Design Conditions</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex justify-between">
            <span>Outdoor Heating (99%):</span>
            <span className="font-bold">{designConditions.heating99}°C</span>
          </div>
          <div className="flex justify-between">
            <span>Indoor Heating:</span>
            <input
              type="number"
              className="w-12 text-right border-b border-gray-300 outline-none"
              value={projectData.indoorTempHeating}
              onChange={(e) => updateProjectData('indoorTempHeating', parseInt(e.target.value))}
            />
          </div>
          <div className="flex justify-between">
            <span>Outdoor Cooling (2.5%):</span>
            <span className="font-bold">{designConditions.cooling25}°C</span>
          </div>
          <div className="flex justify-between">
            <span>Indoor Cooling:</span>
            <input
              type="number"
              className="w-12 text-right border-b border-gray-300 outline-none"
              value={projectData.indoorTempCooling}
              onChange={(e) => updateProjectData('indoorTempCooling', parseInt(e.target.value))}
            />
          </div>
          <div className="flex justify-between">
            <span>Daily Range:</span>
            <span className="font-bold">{designConditions.coolingRange}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
