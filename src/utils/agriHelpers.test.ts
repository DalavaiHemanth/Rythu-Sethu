import { describe, expect, it } from 'vitest';
import { getNPKAdvice, getWeatherDetails } from './agriHelpers';

describe('agriHelpers - NPK Fertilizer Calculator', () => {
  it('should calculate NPK advice correctly for Paddy (Kharif)', () => {
    const advice = getNPKAdvice('paddy', 5, 'kharif');
    // Paddy: Urea = 2.4 * acres, DAP = 1.0 * acres, MOP = 0.8 * acres
    expect(advice.urea).toBe(12);
    expect(advice.dap).toBe(5);
    expect(advice.mop).toBe(4);
  });

  it('should apply 5% discount to Urea during Yasangi (Rabi) season', () => {
    const adviceKharif = getNPKAdvice('paddy', 10, 'kharif');
    const adviceRabi = getNPKAdvice('paddy', 10, 'rabi');

    expect(adviceKharif.urea).toBe(24);
    // 24 * 0.95 = 22.8
    expect(adviceRabi.urea).toBe(22.8);
  });

  it('should calculate NPK advice correctly for Cotton (Kharif)', () => {
    const advice = getNPKAdvice('cotton', 3, 'kharif');
    // Cotton: Urea = 3.2 * acres = 9.6, DAP = 1.3 * acres = 3.9, MOP = 1.2 * acres = 3.6
    expect(advice.urea).toBe(9.6);
    expect(advice.dap).toBe(3.9);
    expect(advice.mop).toBe(3.6);
  });

  it('should calculate NPK advice correctly for Chilli (Kharif)', () => {
    const advice = getNPKAdvice('chilli', 2, 'kharif');
    // Chilli: Urea = 6.4 * 2 = 12.8, DAP = 2.6 * 2 = 5.2, MOP = 2.4 * 2 = 4.8
    expect(advice.urea).toBe(12.8);
    expect(advice.dap).toBe(5.2);
    expect(advice.mop).toBe(4.8);
  });

  it('should calculate NPK advice correctly for Maize (Kharif)', () => {
    const advice = getNPKAdvice('maize', 4, 'kharif');
    // Maize: Urea = 4.2 * 4 = 16.8, DAP = 1.7 * 4 = 6.8, MOP = 1.1 * 4 = 4.4
    expect(advice.urea).toBe(16.8);
    expect(advice.dap).toBe(6.8);
    expect(advice.mop).toBe(4.4);
  });
});

describe('agriHelpers - Weather Engine', () => {
  it('should generate weather details deterministically for a district', () => {
    const details1 = getWeatherDetails('Nalgonda', 'en');
    const details2 = getWeatherDetails('Nalgonda', 'en');
    const details3 = getWeatherDetails('Warangal', 'en');

    expect(details1).toEqual(details2);
    expect(details1.temp).not.toBe(details3.temp);
  });

  it('should localize days in the forecast', () => {
    const detailsEn = getWeatherDetails('Nalgonda', 'en');
    const detailsTe = getWeatherDetails('Nalgonda', 'te');
    const detailsUr = getWeatherDetails('Nalgonda', 'ur');

    expect(detailsEn.forecast[0].day).toBe('Today');
    expect(detailsTe.forecast[0].day).toBe('నేడు');
    expect(detailsUr.forecast[0].day).toBe('آج');
  });

  it('should generate valid advisory and condition strings', () => {
    const details = getWeatherDetails('Nalgonda', 'en');

    expect(typeof details.conditionEn).toBe('string');
    expect(typeof details.advisoryEn).toBe('string');
    expect(details.temp).toBeGreaterThanOrEqual(28);
    expect(details.temp).toBeLessThanOrEqual(41);
  });
});
