import {base64Url} from '../src/lib/realtime';

describe('base64Url', () => {
  it.each([
    ["", ""],
    ["a", "YQ"],
    ["ab", "YWI"],
    ["abc", "YWJj"],
    ["{\"host\":\"x.appsync-api.us-east-2.amazonaws.com\",\"x-api-key\":\"da2-abc\"}", "eyJob3N0IjoieC5hcHBzeW5jLWFwaS51cy1lYXN0LTIuYW1hem9uYXdzLmNvbSIsIngtYXBpLWtleSI6ImRhMi1hYmMifQ"],
  ])('encodes %j for the AppSync auth header', (input, expected) => {
    expect(base64Url(input)).toBe(expected);
  });
});
