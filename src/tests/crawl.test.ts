import { normalizeURL } from "../crawl";

import { describe, expect, test } from "vitest";

describe.each([
    {
        url: "https://blog.boot.dev/path/",
        expected: "blog.boot.dev/path",
    },
    {
        url: "https://blog.boot.dev/path",
        expected: "blog.boot.dev/path",
    },
    {
        url: "http://blog.boot.dev/path/",
        expected: "blog.boot.dev/path",
    },
    {
        url: "http://blog.boot.dev/path",
        expected: "blog.boot.dev/path",
    },
])("normalize($url)", ({ url, expected }) => {
    test(`Expected: ${expected}`, () => {
        const actual = normalizeURL(url);
        expect(actual).toEqual(expected);
    });
});
