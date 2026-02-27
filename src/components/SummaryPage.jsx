import React from 'react';

const SummaryPage = ({ projectData, updateProjectData, rooms, summaryMetrics }) => {
  return (
    <div className="print-page bg-white p-8 border border-gray-200 shadow-md">
      <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-1">
        <h1 className="text-xl font-bold">HRAI Residential Heat Loss and Heat Gain Calculations</h1>
        <div className="text-sm flex gap-2">
          <span>Page</span>
          <span className="border-b border-black px-4 font-bold">3</span>
          <span>of</span>
          <span className="border-b border-black px-4 font-bold">{rooms.length + 3}</span>
        </div>
      </div>

      {/* SECTION A */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs">
          <span>SECTION A</span>
          <span>PROJECT INFORMATION</span>
        </div>
        <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
          <div className="p-2 border-r border-black space-y-2">
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">Client:</span>
              <span className="flex-1">{projectData.clientName}</span>
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">Address:</span>
              <span className="flex-1">{projectData.address}</span>
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">City:</span>
              <span className="flex-1">{projectData.city}</span>
            </div>
          </div>
          <div className="p-2 space-y-2">
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Designer:</span>
              <span className="flex-1">{projectData.designer}</span>
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Date:</span>
              <span className="flex-1">{projectData.date}</span>
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Foundation:</span>
              <span className="flex-1 uppercase font-bold text-blue-800">{projectData.foundationType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs">
          <span>SECTION B</span>
          <span>DESIGN CONDITIONS</span>
        </div>
        <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
          <div className="border-r border-black">
            <div className="bg-gray-100 p-1 font-bold text-center border-b border-black uppercase">Heat Loss</div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>Outdoor Design Temperature Heating (ODT)</span>
                <span className="font-bold text-red-600">{projectData.odtHeating}°F</span>
              </div>
              <div className="flex justify-between">
                <span>Indoor Design Temperature (IDT)</span>
                <span className="font-bold text-red-600">{projectData.idtHeating}°F</span>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-gray-100 p-1 font-bold text-center border-b border-black uppercase">Heat Gain</div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>Outdoor Design Temperature Cooling (ODT)</span>
                <span className="font-bold text-blue-600">{projectData.odtCooling}°F</span>
              </div>
              <div className="flex justify-between">
                <span>Indoor Design Temperature (IDT)</span>
                <span className="font-bold text-blue-600">{projectData.idtCooling}°F</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C - Room Summary Table */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs uppercase">
          <span>SECTION C</span>
          <span>ROOM HEAT LOSS / HEAT GAIN SUMMARY</span>
        </div>
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr className="bg-gray-50 text-center uppercase">
              <th className="border border-black p-1">Level</th>
              <th className="border border-black p-1 text-left">Room Name</th>
              <th className="border border-black p-1 text-red-600">Total Room Loss (Sec 16)</th>
              <th className="border border-black p-1 text-blue-600">Total Room Gain (Sec 17)</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className="text-center h-6 font-bold">
                <td className="border border-black p-1">{room.levelIndex}</td>
                <td className="border border-black p-1 text-left">{room.name}</td>
                <td className="border border-black p-1 text-red-600">{room.totalRoomLoss.toLocaleString()}</td>
                <td className="border border-black p-1 text-blue-600">{room.totalRoomGain.toLocaleString()}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 8 - rooms.length))].map((_, i) => (
              <tr key={i} className="h-6">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTIONS 18 - 23: BUILDING TOTALS */}
      <div className="grid grid-cols-2 gap-4">
        {/* LOSS SUMMARY */}
        <div className="border border-black">
          <div className="bg-[#d9e2d5] p-1 px-2 font-bold text-center border-b border-black text-xs uppercase">Building Heat Loss Summary</div>
          <div className="p-2 space-y-2 text-[10px]">
            <div className="flex justify-between items-center border-b pb-1">
              <span>18. Building Sub Total Heat Loss</span>
              <span className="font-bold text-red-600">{summaryMetrics.subTotalLoss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span>19. Forced Air Ventilation Heat Loss</span>
              <span className="font-bold text-red-600">{summaryMetrics.ventilationLoss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 p-1 font-bold text-sm">
              <span className="uppercase">20. Total Building Heat Loss</span>
              <span className="text-red-700">{summaryMetrics.totalLoss.toLocaleString()} Btuh</span>
            </div>
          </div>
        </div>

        {/* GAIN SUMMARY */}
        <div className="border border-black">
          <div className="bg-[#d9e2d5] p-1 px-2 font-bold text-center border-b border-black text-xs uppercase">Building Heat Gain Summary</div>
          <div className="p-2 space-y-2 text-[10px]">
            <div className="flex justify-between items-center border-b pb-1">
              <span>21. Building Sub Total Heat Gain</span>
              <span className="font-bold text-blue-600">{summaryMetrics.subTotalGain.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span>22. Forced Air Ventilation Heat Gain</span>
              <span className="font-bold text-blue-600">{summaryMetrics.ventilationGain.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-1 font-bold text-sm">
              <span className="uppercase">23. Total Building Heat Gain</span>
              <span className="text-blue-700">{summaryMetrics.totalGain.toLocaleString()} Btuh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2 border border-black bg-gray-50 flex justify-between items-center font-bold text-xs uppercase">
        <span>Building Volume (Vb)</span>
        <span className="text-sm">{summaryMetrics.buildingVolume.toLocaleString()} ft³</span>
      </div>
    </div>
  );
};

export default SummaryPage;
