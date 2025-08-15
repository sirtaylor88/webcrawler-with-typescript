import { argv, exit } from 'node:process';
import { printReport } from "./report.js";
import { crawlSiteAsync } from './crawl.js';

async function main() {
    if (argv.length < 3) {
        console.log("Missing URL");
        exit(1);
    }

    if (argv.length > 3) {
        console.log("Unknow parameters");
        exit(1);
    }

    const baseURL = argv[2];
    const pages = await crawlSiteAsync(baseURL, 1);
    printReport(baseURL, pages);
    exit(0);
}

main();
