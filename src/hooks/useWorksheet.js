import { useState, useMemo, useCallback } from 'react';
import library from '../data/library.json';
import { calculateHeatLoss, calculateWindowGain } from '../utils/calculations';

export const useWorksheet = () => {
  const [projectData, setProjectData] = useState({
    clientName: '',
    address: '',
    city: 'Toronto',
    designer: '',
    date: new Date().toISOString().split('T')[0],
    indoorTempHeating: 22,
    indoorTempCooling: 24
  });

  const [rooms, setRooms] = useState([
    {
      id: Date.now(),
      name: 'Main Living Area',
      dimensions: { perimeter: 60, height: 9 },
      assemblies: [
        { id: 'a1', type: 'wall', libraryId: 'wall-1', area: 540, orientation: 'North' },
        { id: 'a2', type: 'window', libraryId: 'window-1', area: 60, orientation: 'North' }
      ]
    }
  ]);

  const designConditions = useMemo(() => {
    return library.designConditions.locations.find(l => l.city === projectData.city) || library.designConditions.locations[0];
  }, [projectData.city]);

  const updateProjectData = useCallback((key, value) => {
    setProjectData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateRoom = useCallback((roomId, updates) => {
    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, ...updates } : room));
  }, []);

  const calculateRoomMetrics = useCallback((room) => {
    const deltaT_Loss = projectData.indoorTempHeating - designConditions.heating99;
    const deltaT_Gain = designConditions.cooling25 - projectData.indoorTempCooling;

    const openingsArea = room.assemblies
      .filter(asm => asm.type !== 'wall')
      .reduce((sum, asm) => sum + (asm.area || 0), 0);

    const grossWallArea = room.dimensions.perimeter * room.dimensions.height;
    const netWallArea = Math.max(0, grossWallArea - openingsArea);

    let totalLoss = 0;
    let totalGain = 0;

    const processedAssemblies = room.assemblies.map(asm => {
      const libAsm = library.assemblies.find(l => l.id === asm.libraryId);
      const uFactor = libAsm?.uFactor || 0;

      const effectiveArea = asm.type === 'wall' ? netWallArea : asm.area;

      let loss = calculateHeatLoss(uFactor, effectiveArea, deltaT_Loss);
      let gain = 0;

      if (asm.type === 'window') {
        const sgf = library.solarGainFactors[asm.orientation] || 50;
        gain = calculateWindowGain(uFactor, libAsm.shgc || 0, effectiveArea, deltaT_Gain, sgf);
      } else {
        gain = calculateHeatLoss(uFactor, effectiveArea, deltaT_Gain);
      }

      totalLoss += loss;
      totalGain += gain;

      return { ...asm, effectiveArea, loss, gain, description: libAsm?.description };
    });

    return {
      ...room,
      assemblies: processedAssemblies,
      totalLoss,
      totalGain,
      grossWallArea,
      netWallArea
    };
  }, [designConditions, projectData.indoorTempHeating, projectData.indoorTempCooling]);

  const calculatedRooms = useMemo(() => {
    return rooms.map(calculateRoomMetrics);
  }, [rooms, calculateRoomMetrics]);

  return {
    projectData,
    designConditions,
    rooms: calculatedRooms,
    updateProjectData,
    updateRoom,
    locations: library.designConditions.locations,
    assemblies: library.assemblies
  };
};
