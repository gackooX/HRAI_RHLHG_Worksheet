
import { calculateComponentFactors } from './src/utils/calculations.js';
import { complianceData } from './src/data/complianceData.js';

const mockState = {
  compliance: {
    selectedPackage: 'A1',
    effRValues: {}
  },
  environmental: {
    hl_idt: 72,
    hl_odt: -6,
    hg_odt: 86,
    hg_idt: 72,
    hg_north_latitude: 44
  },
  globalWindowConfig: {
    type: 'Double', frame: 'Operable-Aluminum', spacer: 'Insulating', coating: 'Clear', gapGas: '1/4 Air'
  }
};

const factors = calculateComponentFactors(mockState);
const expectedU = complianceData['A1'].windows.maxU;
const expectedR = 1 / expectedU;

console.log('Selected Package: A1');
console.log('Compliance U:', expectedU);
console.log('Calculated R-Eff:', factors.windows.rEff);
console.log('Expected R:', expectedR);

if (Math.abs(factors.windows.rEff - expectedR) < 0.0001) {
    console.log('SUCCESS: Window R-value is correctly derived from compliance U-factor.');
} else {
    console.log('FAILURE: R-value mismatch.');
    process.exit(1);
}
