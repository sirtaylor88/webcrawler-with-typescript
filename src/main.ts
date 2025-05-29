import { crawlPage} from "./crawl.js";
import { argv, exit } from 'node:process';
import { printReport } from "./report.js";

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
    const pages: Record<string, number> = {}
    await crawlPage(baseURL, baseURL, pages);
    printReport(baseURL, pages);
    exit(0);
}

main();
