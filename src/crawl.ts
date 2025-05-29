import { JSDOM } from 'jsdom';

export function normalizeURL(url: string): string{
    const objectURL = new URL(url);
    return objectURL.hostname + objectURL.pathname.replace(/\/+$/, "");
};

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const links = dom.window.document.querySelectorAll('a');
    const result: string[] = [];
    for (const [, v] of links.entries()) {
        const url = v.getAttribute('href');
        if (url?.startsWith('http')) {
            result.push(url);
        } else {
            result.push(`${baseURL}${url}`);
        }
    }
    return result;
};

export async function getHTML(url: string): Promise<string> {
    const response = await fetch(url);
    if (response.status > 399) {
        console.log("Got unexpected error!");
        return '';
    }
    if (!response.headers.get('content-type')?.includes('text/html')) {
        console.log("Response is not HTML!");
        return '';
    }
    return response.text();
};

function isSameDomain(url: string, otherURL: string): boolean {
    const objectURL = new URL(url);
    const otherObjectURL = new URL(otherURL);
    return objectURL.hostname === otherObjectURL.hostname;
}

export async function crawlPage(
  baseURL: string,
  currentURL: string,
  pages: Record<string, number>,
): Promise<Record<string, number>> {
    if (!isSameDomain(baseURL, currentURL)) {
        return pages;
    }

    const url = normalizeURL(currentURL);

    if (url in pages) {
        pages[url]++;
    } else {
        pages[url] = 1;
    }

    console.log(`Crawling ${url}...`);
    const html = await getHTML(currentURL);
    const urls = getURLsFromHTML(html, currentURL);
    console.log(urls)

    for (const url of urls) {
        crawlPage(baseURL, url, pages);
    }

    return pages;
};
