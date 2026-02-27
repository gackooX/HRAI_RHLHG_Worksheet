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

    // Section B Design Conditions
    odtHeating: -6, // °F
    idtHeating: 72, // °F
    meanSoilTemp: 50, // °F
    odtCooling: 88, // °F
    idtCooling: 75, // °F
    northLatitude: 44,
    summerRange: 20, // °F

    buildingVolume: 5200, // ft3
    conditionedArea: 975, // ft2
    hrvEffectiveness: 0.6,
    ventilationSystem: 'Case #3' // Default
  });

  const [rooms, setRooms] = useState([
    {
      id: 1,
      level: '1',
      name: 'REC RM',
      dimensions: { perimeter: 40, height: 8 },
      assemblies: [
        { id: 'r1a1', type: 'wall', libraryId: 'wall-1', area: 320, orientation: 'North' },
        { id: 'r1a2', type: 'window', libraryId: 'window-1', area: 40, orientation: 'North' }
      ]
    },
    {
      id: 2,
      level: '2',
      name: 'BED. RM 1',
      dimensions: { perimeter: 30, height: 8 },
      assemblies: [
        { id: 'r2a1', type: 'wall', libraryId: 'wall-1', area: 240, orientation: 'East' }
      ]
    }
  ]);

  const updateProjectData = useCallback((key, value) => {
    setProjectData(prev => {
      const newData = { ...prev, [key]: value };

      // Relational Logic: Update design conditions if city changes
      if (key === 'city') {
        const location = library.designConditions.locations.find(l => l.city === value);
        if (location) {
          newData.odtHeating = location.odtHeating;
          newData.odtCooling = location.odtCooling;
          newData.summerRange = location.summerRange;
          newData.northLatitude = location.latitude;
        }
      }

      return newData;
    });
  }, []);

  const updateRoom = useCallback((roomId, updates) => {
    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, ...updates } : room));
  }, []);

  const calculateRoomMetrics = useCallback((room) => {
    // Note: Using projectData values instead of designConditions from library for reactive inputs
    const deltaT_Loss = projectData.idtHeating - projectData.odtHeating;
    const deltaT_Gain = projectData.odtCooling - projectData.idtCooling;

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
  }, [projectData.odtHeating, projectData.idtHeating, projectData.odtCooling, projectData.idtCooling]);

  const calculatedRooms = useMemo(() => {
    return rooms.map(calculateRoomMetrics);
  }, [rooms, calculateRoomMetrics]);

  const summaryMetrics = useMemo(() => {
    const subTotalLoss = calculatedRooms.reduce((sum, r) => sum + r.totalLoss, 0);
    const subTotalGain = calculatedRooms.reduce((sum, r) => sum + r.totalGain, 0);

    // Dummy ventilation calculation for demo, based on volume and effectiveness
    // In real HRAI, this depends on ACH or prescribed CFM
    const ventilationLoss = Math.round(subTotalLoss * 0.3 * (1 - projectData.hrvEffectiveness));
    const ventilationGain = Math.round(subTotalGain * 0.1 * (1 - projectData.hrvEffectiveness));

    return {
      subTotalLoss,
      subTotalGain,
      ventilationLoss,
      ventilationGain,
      totalLoss: subTotalLoss + ventilationLoss,
      totalGain: subTotalGain + ventilationGain
    };
  }, [calculatedRooms, projectData.hrvEffectiveness]);

  return {
    projectData,
    rooms: calculatedRooms,
    summaryMetrics,
    updateProjectData,
    updateRoom,
    locations: library.designConditions.locations,
    assemblies: library.assemblies
  };
};
