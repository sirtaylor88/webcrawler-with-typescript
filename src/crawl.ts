import { JSDOM } from 'jsdom';
import pLimit, { LimitFunction } from 'p-limit';

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

function isSameDomain(url: string, otherURL: string): boolean {
    const objectURL = new URL(url);
    const otherObjectURL = new URL(otherURL);
    return objectURL.hostname === otherObjectURL.hostname;
}

export class ConcurrentCrawler {

    baseURL: string
    pages: Record<string, number>
    limit: LimitFunction

    constructor(baseURL: string, maxConcurrency: number) {
        this.baseURL = baseURL
        this.pages = {}
        this.limit = pLimit(maxConcurrency)
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (Object.hasOwn(this.pages, normalizedURL)) {
            this.pages[normalizedURL]++
            return true;
        }

        this.pages[normalizedURL] = 0

        return false
    }

    private async getHTML(currentURL: string): Promise<string> {
        return await this.limit(async () => {
            const response = await fetch(currentURL);
            if (response.status > 399) {
                console.log("Got unexpected error!");
                return '';
            }
            if (!response.headers.get('content-type')?.includes('text/html')) {
                console.log("Response is not HTML!");
                return '';
            }
            return response.text();
        });
    }

    private async crawlPage(currentURL: string): Promise<void> {
        if (!isSameDomain(this.baseURL, currentURL)) {
            return;
        }

        const url = normalizeURL(currentURL);
        if (!this.addPageVisit(url)) {
            return
        }


        console.log(`Crawling ${url}...`);
        const html = await this.getHTML(currentURL);
        const urls = getURLsFromHTML(html, currentURL);
        console.log(urls);

        const promises: Promise<unknown>[] = [];
        for (const url of urls) {
            const promise = new Promise(() => {
                this.crawlPage(url);
            })
            promises.push(promise);
        }
        await Promise.all(promises);
    }

    crawl() {
        this.crawlPage(this.baseURL);
    }
}

export async function crawlSiteAsync(
    url: string,
    maxConcurrency: number
): Promise<Record<string, number>> {
    const crawler = new ConcurrentCrawler(url, maxConcurrency);
    await crawler.crawl();

    return crawler.pages;
}
