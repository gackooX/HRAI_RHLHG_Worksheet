import React from 'react';

const ReportGenerator = ({ state }) => {
  const isMetric = state.displayUnits === 'METRIC';

  return (
    <div className="report-container font-serif text-[10px] space-y-8 print:space-y-0">
      {state.rooms.map((room, idx) => {
        return (
          <div key={idx} className="print-page border-[2px] border-black p-4 relative bg-white overflow-hidden page-break" style={{ width: '8.5in', height: '11in' }}>
            {/* HRAI Header Grid */}
            <div className="grid grid-cols-12 border-b-2 border-black mb-2">
              <div className="col-span-8 p-1 border-r-2 border-black">
                <h1 className="text-lg font-black uppercase">Residential Heat Loss & Heat Gain Worksheet</h1>
              </div>
              <div className="col-span-4 p-1 flex justify-between px-4">
                <span className="font-bold">Page:</span>
                <span className="border-b border-black w-12 text-center">{idx + 1}</span>
              </div>
            </div>

            {/* Address & Direction */}
            <div className="grid grid-cols-12 border-b border-black mb-4">
              <div className="col-span-8 p-1 border-r border-black">
                <span className="font-bold mr-2">Address:</span>
                <span>{state.header.address}</span>
              </div>
              <div className="col-span-4 p-1">
                <span className="font-bold mr-2">Front Facing:</span>
                <span className="text-blue-800 font-bold">{state.header.front_facing_direction}</span>
              </div>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-4 gap-0 border border-black mb-4 bg-gray-50">
              <div className="border-r border-black p-1 text-center">
                <div className="font-bold uppercase text-[8px]">Room Name</div>
                <div className="text-sm font-black text-blue-900">{room.name}</div>
              </div>
              <div className="border-r border-black p-1 text-center">
                <div className="font-bold uppercase text-[8px]">Level</div>
                <div>{room.level}</div>
              </div>
              <div className="border-r border-black p-1 text-center">
                <div className="font-bold uppercase text-[8px]">Volume (Vb)</div>
                <div className="font-bold">{room.volume} ft³</div>
              </div>
              <div className="p-1 text-center">
                <div className="font-bold uppercase text-[8px]">Header Area</div>
                <div className="font-bold">{room.headerArea?.toFixed(2)} ft²</div>
              </div>
            </div>

            {/* The Main Calculation Grid (High Fidelity Mirror) */}
            <div className="border-2 border-black">
               <div className="grid grid-cols-10 bg-gray-200 border-b border-black font-bold text-center">
                  <div className="col-span-4 border-r border-black">Components</div>
                  <div className="border-r border-black">Area</div>
                  <div className="border-r border-black">U-Factor</div>
                  <div className="col-span-2 border-r border-black text-red-700">Heat Loss</div>
                  <div className="col-span-2 text-blue-700">Heat Gain</div>
               </div>

               {/* 6 Window Directions Mapping */}
               {Object.entries(room.windows || {}).map(([dir, area]) => (
                 area > 0 && (
                   <div key={dir} className="grid grid-cols-10 border-b border-gray-300 h-6 items-center">
                      <div className="col-span-4 px-2 border-r border-gray-300">Window ({dir.replace('_', '/')})</div>
                      <div className="text-center border-r border-gray-300">{area}</div>
                      <div className="text-center border-r border-gray-300">0.32</div>
                      <div className="col-span-2 text-center border-r border-gray-300 text-red-600">---</div>
                      <div className="col-span-2 text-center text-blue-600">---</div>
                   </div>
                 )
               ))}

               <div className="grid grid-cols-10 border-b border-black h-6 items-center">
                  <div className="col-span-8 px-2 font-bold border-r border-black text-right uppercase">Conductive Sub-Total</div>
                  <div className="border-r border-black text-center text-red-600 font-bold">{room.conductiveLoss}</div>
                  <div className="text-center text-blue-600 font-bold">{room.conductiveGain}</div>
               </div>

               <div className="grid grid-cols-10 border-b border-black h-6 items-center">
                  <div className="col-span-8 px-2 font-bold border-r border-black text-right uppercase text-[8px]">Air Leakage (H: {state.externalValues.LRairh} / C: {state.externalValues.LRairc})</div>
                  <div className="border-r border-black text-center text-red-600 font-bold">{room.airLeakageLoss}</div>
                  <div className="text-center text-blue-600 font-bold">{room.airLeakageGain}</div>
               </div>

               {/* Occupancy Injection */}
               <div className="grid grid-cols-10 border-b border-black h-8 items-center bg-blue-50">
                  <div className="col-span-8 px-2 font-bold border-r border-black text-right uppercase">Section 13: Occupancy Gain ({room.occupancy} people)</div>
                  <div className="col-span-2 text-center text-blue-800 font-black">{room.occupancyGain}</div>
               </div>

               {/* Section 17 Injection */}
               <div className="grid grid-cols-10 h-10 items-center bg-gray-300">
                  <div className="col-span-8 px-2 font-black border-r border-black text-right text-sm uppercase">Section 17: Total Room Load (Loss / Gain x1.3)</div>
                  <div className="border-r border-black text-center text-red-900 text-lg font-black">{room.totalRoomLoss}</div>
                  <div className="text-center text-blue-900 text-lg font-black">{room.totalRoomGain}</div>
               </div>
            </div>

            {/* Footer Multipliers */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-bold text-gray-500 italic">
               <span>HL ΔT: {state.designMultipliers.hl_delta_t}</span>
               <span>HG ΔT: {state.designMultipliers.hg_delta_t}</span>
               <span>LRairh: {state.externalValues.LRairh}</span>
               <span>LRairc: {state.externalValues.LRairc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportGenerator;
