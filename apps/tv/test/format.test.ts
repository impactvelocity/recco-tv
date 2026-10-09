import {alexaLine, formatPhone, metaLine, servicesLine} from '../src/lib/format';

describe('format', () => {
  it('formats North American numbers', () => {
    expect(formatPhone('+16045550142')).toBe('(604) 555-0142');
    expect(formatPhone('+442079460958')).toBe('+442079460958');
  });

  it('builds the Alexa line from the title (R9.1)', () => {
    expect(alexaLine('The King of Queens')).toBe('Hold the mic button and say “Watch The King of Queens”');
  });

  it('describes services, including none (R5.3)', () => {
    expect(servicesLine(['Netflix', 'Crave'])).toBe('On Netflix, Crave');
    expect(servicesLine([])).toBe('Not on a streaming service in Canada yet');
  });

  it('joins year and type', () => {
    expect(metaLine({year: '2022–', type: 'series'})).toBe('2022– · Series');
    expect(metaLine({year: undefined, type: 'unknown'})).toBe('');
  });
});
