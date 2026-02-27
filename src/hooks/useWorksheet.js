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
    odtHeating: -2, // °F (Fixed from -6 based on library default for Toronto)
    idtHeating: 72, // °F
    meanSoilTemp: 50, // °F
    odtCooling: 86, // °F (Fixed from 88)
    idtCooling: 75, // °F
    northLatitude: 44,
    summerRange: 18, // °F

    // Building Info
    foundationType: 'BASEMENT', // 'BASEMENT' or 'SLAB ON GRADE'
    basementHeight: 8,
    lrAirHeating: 0.873, // LRairh
    lrAirCooling: 0.030, // LRairc
    displayUnits: 'IMPERIAL', // 'IMPERIAL' or 'METRIC'

    hrvEffectiveness: 0.6,
    ventilationCFM: 150,
    ventilationSystem: 'Case #3'
  });

  const [rooms, setRooms] = useState([
    {
      id: 1,
      levelIndex: 1,
      name: 'REC RM',
      dimensions: { perimeter: 40, height: 8, floorArea: 500 },
      assemblies: [
        { id: 'r1a1', type: 'wall', libraryId: 'wall-1', area: 0, orientation: 'North' },
        { id: 'r1a2', type: 'window', libraryId: 'window-1', area: 40, orientation: 'North' }
      ],
      otherLoads: {
        internalGain: 1434,
        ductLoss: 0,
        ductGain: 0
      }
    }
  ]);

  // Derived: Dynamic Level Naming
  const getLevelName = useCallback((index) => {
    if (projectData.foundationType === 'BASEMENT') {
      if (index === 1) return 'Basement';
      return `Level ${index - 1}`;
    } else {
      return `Level ${index}`;
    }
  }, [projectData.foundationType]);

  const updateProjectData = useCallback((key, value) => {
    setProjectData(prev => {
      const newData = { ...prev, [key]: value };
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

  const addRoom = useCallback(() => {
    const newId = Date.now();
    setRooms(prev => [
      ...prev,
      {
        id: newId,
        levelIndex: 1,
        name: `New Room`,
        dimensions: { perimeter: 0, height: 8, floorArea: 0 },
        assemblies: [
          { id: `${newId}a1`, type: 'wall', libraryId: 'wall-1', area: 0, orientation: 'North' }
        ],
        otherLoads: {
          internalGain: 0,
          ductLoss: 0,
          ductGain: 0
        }
      }
    ]);
  }, []);

  const removeRoom = useCallback((id) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  }, []);

  const calculateRoomMetrics = useCallback((room) => {
    const deltaT_Loss = projectData.idtHeating - projectData.odtHeating;
    const deltaT_Gain = projectData.odtCooling - projectData.idtCooling;

    const openingsArea = room.assemblies
      .filter(asm => asm.type !== 'wall')
      .reduce((sum, asm) => sum + (asm.area || 0), 0);

    const grossWallArea = room.dimensions.perimeter * room.dimensions.height;
    const netWallArea = Math.max(0, grossWallArea - openingsArea);

    let totalConductiveLoss = 0;
    let totalConductiveGain = 0;

    const processedAssemblies = room.assemblies.map(asm => {
      const libAsm = library.assemblies.find(l => l.id === asm.libraryId);
      const uFactor = libAsm?.uFactor || 0;
      const shgc = libAsm?.shgc || 0;
      const effectiveArea = asm.type === 'wall' ? netWallArea : asm.area;

      let loss = calculateHeatLoss(uFactor, effectiveArea, deltaT_Loss);
      let gain = 0;

      if (asm.type === 'window') {
        const sgf = library.solarGainFactors[asm.orientation] || 50;
        gain = calculateWindowGain(uFactor, shgc, effectiveArea, deltaT_Gain, sgf);
      } else {
        gain = calculateHeatLoss(uFactor, effectiveArea, deltaT_Gain);
      }

      totalConductiveLoss += loss;
      totalConductiveGain += gain;

      return {
        ...asm,
        effectiveArea,
        loss,
        gain,
        description: libAsm?.description,
        uFactor,
        shgc,
        rValue: uFactor > 0 ? (1 / uFactor).toFixed(2) : '0'
      };
    });

    // Section 11: Air Leakage
    const airLeakageLoss = Math.round(totalConductiveLoss * projectData.lrAirHeating);
    const airLeakageGain = Math.round(totalConductiveGain * projectData.lrAirCooling);

    // Section 14: Net Loads
    const netLoadsLoss = totalConductiveLoss + airLeakageLoss;
    const netLoadsGain = totalConductiveGain + airLeakageGain + (room.otherLoads?.internalGain || 0);

    // Section 16/17
    const totalRoomLoss = netLoadsLoss + (room.otherLoads?.ductLoss || 0);
    const totalRoomGain = Math.round((netLoadsGain + (room.otherLoads?.ductGain || 0)) * 1.3);

    return {
      ...room,
      level: getLevelName(room.levelIndex),
      assemblies: processedAssemblies,
      totalConductiveLoss,
      totalConductiveGain,
      airLeakageLoss,
      airLeakageGain,
      netLoadsLoss,
      netLoadsGain,
      totalRoomLoss,
      totalRoomGain,
      grossWallArea,
      netWallArea,
      volume: (room.dimensions.floorArea || 0) * (room.dimensions.height || 0)
    };
  }, [projectData, getLevelName]);

  const calculatedRooms = useMemo(() => {
    return rooms.map(calculateRoomMetrics);
  }, [rooms, calculateRoomMetrics]);

  const buildingVolume = useMemo(() => {
    return calculatedRooms.reduce((sum, r) => sum + r.volume, 0);
  }, [calculatedRooms]);

  const summaryMetrics = useMemo(() => {
    const subTotalLoss = calculatedRooms.reduce((sum, r) => sum + r.totalRoomLoss, 0);
    const subTotalGain = calculatedRooms.reduce((sum, r) => sum + r.totalRoomGain, 0);

    // HRAI F280-12 Ventilation Calculation: 1.08 * CFM * ΔT * (1 - Efficiency)
    const deltaT_Loss = projectData.idtHeating - projectData.odtHeating;
    const deltaT_Gain = projectData.odtCooling - projectData.idtCooling;

    const ventilationLoss = Math.round(1.08 * projectData.ventilationCFM * deltaT_Loss * (1 - projectData.hrvEffectiveness));
    const ventilationGain = Math.round(1.08 * projectData.ventilationCFM * deltaT_Gain); // Typically no HRV credit for sensible cooling in basic models

    return {
      subTotalLoss,
      subTotalGain,
      ventilationLoss,
      ventilationGain,
      totalLoss: subTotalLoss + ventilationLoss,
      totalGain: subTotalGain + ventilationGain,
      buildingVolume
    };
  }, [calculatedRooms, buildingVolume, projectData]);

  const floorWiseSummary = useMemo(() => {
    const summary = {};
    calculatedRooms.forEach(room => {
      const lvl = room.level;
      if (!summary[lvl]) summary[lvl] = { loss: 0, gain: 0 };
      summary[lvl].loss += room.totalRoomLoss;
      summary[lvl].gain += room.totalRoomGain;
    });
    return summary;
  }, [calculatedRooms]);

  return {
    projectData,
    rooms: calculatedRooms,
    summaryMetrics,
    floorWiseSummary,
    updateProjectData,
    updateRoom,
    addRoom,
    removeRoom,
    locations: library.designConditions.locations,
    assemblies: library.assemblies,
    getLevelName
  };
};
