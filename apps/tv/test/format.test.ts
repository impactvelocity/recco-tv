import {
  alexaLine,
  formatPhone,
  initials,
  longMetaLine,
  messageOf,
  metaLine,
  namesLabel,
  posterAt600,
  senderName,
  stackTitle,
  timeAgo,
} from '../src/lib/format';

const friends = [{id: 'f1', name: 'Steph', createdAt: '', ratedUp: 0, rated: 0}];

describe('format', () => {
  it('formats North American numbers', () => {
    expect(formatPhone('+16045550142')).toBe('(604) 555-0142');
    expect(formatPhone('+442079460958')).toBe('+442079460958');
  });

  it('builds the Alexa line from the title (R9.1)', () => {
    expect(alexaLine('The King of Queens')).toBe('“Alexa, watch The King of Queens”');
  });

  it('joins type, year, runtime and genre, skipping gaps', () => {
    expect(metaLine({year: '2022–', type: 'series'})).toBe('Series · 2022–');
    expect(metaLine({year: undefined, type: 'unknown'})).toBe('');
    expect(longMetaLine({year: '2024', type: 'movie', runtime: '2h 46m', genre: 'Sci-fi'})).toBe('Film · 2024 · 2h 46m · Sci-fi');
    expect(longMetaLine({year: '2024', type: 'movie'})).toBe('Film · 2024');
  });

  it('names who a card came from', () => {
    expect(senderName({origin: 'friend', friendId: 'f1'}, friends)).toBe('Steph');
    expect(senderName({origin: 'me'}, friends)).toBe('Me');
    expect(senderName({origin: 'recco'}, friends)).toBe("Recco's picks");
    expect(initials("Recco's picks")).toBe('✦');
    expect(senderName({origin: 'internet', sourceUrl: 'https://www.tiktok.com/@x/video/1'}, friends)).toBe('TikTok');
    expect(senderName({origin: 'internet', sourceUrl: 'https://youtu.be/abc'}, friends)).toBe('YouTube');
    expect(senderName({origin: 'internet', sourceUrl: 'https://example.com'}, friends)).toBe('A link');
    expect(initials('Steph')).toBe('S');
    expect(initials('TikTok')).toBe('TT');
  });

  it('labels several recommenders', () => {
    expect(namesLabel(['Steph'])).toBe('Steph');
    expect(namesLabel(['Steph', 'Dad'])).toBe('Steph & Dad');
    expect(namesLabel(['Steph', 'Dad', 'Mom', 'Jo'])).toBe('Steph, Dad +2');
  });

  it('fills the bubble with her words, or names the link', () => {
    expect(messageOf({note: 'trust me', source: 'text'})).toBe('trust me');
    expect(messageOf({source: 'link', sourceUrl: 'https://www.instagram.com/p/1'})).toBe('Instagram link');
    expect(messageOf({source: 'text'})).toBeUndefined();
    expect(stackTitle({source: 'link', sourceUrl: 'https://www.tiktok.com/@x/video/1'})).toBe('From a TikTok');
    expect(stackTitle({source: 'text'})).toBe('From one text');
  });

  it('says how long ago, like a messages app', () => {
    const now = new Date(2026, 9, 14, 18, 0); // Wednesday
    const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).toISOString();
    expect(timeAgo(at(14, 17, 59), now)).toBe('1m ago');
    expect(timeAgo(at(14, 18), now)).toBe('Just now');
    expect(timeAgo(at(14, 13), now)).toBe('5h ago');
    expect(timeAgo(at(13, 23), now)).toBe('Yesterday');
    expect(timeAgo(at(12, 9), now)).toBe('Mon');
    expect(timeAgo(at(3, 9), now)).toBe('Oct 3');
  });

  it('asks OMDb for the larger poster', () => {
    expect(posterAt600('https://m.media-amazon.com/images/M/x._V1_SX300.jpg')).toBe('https://m.media-amazon.com/images/M/x._V1_SX600.jpg');
  });
});
