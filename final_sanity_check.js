import { initialState } from './src/state/projectState.js';
import { calculateComponentFactors } from './src/utils/calculations.js';

try {
    const factors = calculateComponentFactors(initialState);
    console.log('Sanity Check Passed: Factors calculated successfully from initialState');
    console.log('Window HL Factor:', factors.windows.hlFactor.toFixed(2));
} catch (e) {
    console.error('Sanity Check Failed:', e.message);
    process.exit(1);
}
