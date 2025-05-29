export function printReport(baseURL: string, pages: Record<string, number>) {
    console.log('=============================');
    console.log(`REPORT for ${baseURL}`);
    console.log('=============================');

    for (const [k, v] of Object.entries(pages)) {
        if (k !== baseURL) {
            console.log(`Found ${v} internal links to ${k}`);
        }
    }
}
