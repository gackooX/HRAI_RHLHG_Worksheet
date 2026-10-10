import React from 'react';

const RoomManagement = ({ rooms, activeIndex, onSelect, onAdd, onRemove, onDuplicate }) => {
  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left side: Scrollable room list */}
      <div className="w-1/3 bg-gray-800 rounded-lg shadow-inner overflow-y-auto border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
          <h3 className="font-black uppercase text-gray-400 text-xs">Project Rooms</h3>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-2 py-1 rounded uppercase transition-colors"
          >
            + Add Room
          </button>
        </div>
        <div className="divide-y divide-gray-700">
          {rooms.map((room, index) => (
            <div
              key={index}
              onClick={() => onSelect(index)}
              className={`p-4 cursor-pointer transition-colors group ${activeIndex === index ? 'bg-blue-900/40 border-l-4 border-blue-500' : 'hover:bg-gray-700'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-white">{room.name || `Room ${index + 1}`}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">{room.level}</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(index); }}
                    title="Duplicate"
                    className="text-gray-400 hover:text-green-500"
                  >
                    👯
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    title="Remove"
                    className="text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-[10px] font-black uppercase">
                <span className="text-red-500">Loss: {room.totalRoomLoss || 0}</span>
                <span className="text-blue-500">Gain: {room.totalRoomGain || 0}</span>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-bold italic">
              No rooms added yet.
            </div>
          )}
        </div>
      </div>

      {/* Right side: Detailed view / Instruction */}
      <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 p-8 overflow-y-auto">
        {activeIndex !== null && rooms[activeIndex] ? (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
               <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter">{rooms[activeIndex].name || `Room ${activeIndex + 1}`}</h2>
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{rooms[activeIndex].level} Configuration</p>
               </div>
               <div className="text-right">
                 <div className="text-xs font-black text-gray-500 uppercase">Total Load</div>
                 <div className="text-2xl font-black text-white">{(rooms[activeIndex].totalRoomLoss + rooms[activeIndex].totalRoomGain).toLocaleString()} <span className="text-xs font-normal text-gray-400">BTU/H</span></div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 border-l-2 border-blue-500 pl-2">Geometry Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded border border-gray-700">
                      <label>Floor Area</label>
                      <div className="text-lg font-black">{rooms[activeIndex].floorArea} <span className="text-[10px] text-gray-500">sq ft</span></div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded border border-gray-700">
                      <label>Perimeter</label>
                      <div className="text-lg font-black">{rooms[activeIndex].perimeter} <span className="text-[10px] text-gray-500">ft</span></div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 border-l-2 border-red-500 pl-2">Heat Loss Components</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold border-b border-gray-800 py-1">
                      <span className="text-gray-400">Conductive Loss</span>
                      <span className="text-white">{rooms[activeIndex].conductiveLoss} BTU/h</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-gray-800 py-1">
                      <span className="text-gray-400">Air Leakage Loss</span>
                      <span className="text-white">{rooms[activeIndex].airLeakageLoss} BTU/h</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2">
                      <span className="text-red-500 uppercase">Total Room Loss</span>
                      <span className="text-red-500">{rooms[activeIndex].totalRoomLoss} BTU/h</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                 <section>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 border-l-2 border-blue-500 pl-2">Heat Gain Components</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold border-b border-gray-800 py-1">
                      <span className="text-gray-400">Conductive Gain</span>
                      <span className="text-white">{rooms[activeIndex].conductiveGain} BTU/h</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-gray-800 py-1">
                      <span className="text-gray-400">Solar / Window Gain</span>
                      <span className="text-white">{rooms[activeIndex].totalWindowGain} BTU/h</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-gray-800 py-1">
                      <span className="text-gray-400">Occupancy Gain</span>
                      <span className="text-white">{rooms[activeIndex].occupancyGain} BTU/h</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2">
                      <span className="text-blue-500 uppercase">Total Room Gain</span>
                      <span className="text-blue-500">{rooms[activeIndex].totalRoomGain} BTU/h</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
               <button
                 onClick={() => onSelect(activeIndex, true)}
                 className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
               >
                 Launch Room Wizard
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4 grayscale opacity-20">🏢</div>
            <h3 className="text-xl font-black text-gray-600 uppercase tracking-tighter">Select a Room to Inspect</h3>
            <p className="text-sm text-gray-700 max-w-xs mt-2 font-bold">Manage individual room configurations, duplicate successful designs, or launch the engineering wizard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
