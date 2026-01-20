import puppeteer from "puppeteer";

export class ConafService {
    /**
     * Scrapes "Situación Nacional" from CONAF Power BI
     * URL: https://app.powerbi.com/view...
     */
    static async getSituacion() {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Power BI is heavy, we need to wait for network idle
            await page.goto("https://app.powerbi.com/view?r=eyJrIjoiZDZjZTExZTctM2MwMC00Mzk5LTkzYzAtODNlOTk0NDAzMWY5IiwidCI6IjZlMTA2YmFkLTk5NTAtNDcxNC1iY2JhLWZlYTUwMDNlNTY4OCIsImMiOjR9", {
                waitUntil: "domcontentloaded", // Faster than networkidle2
                timeout: 45000 // Slightly shorter timeout to not hang too long
            });

            // Wait for the text to appear (e.g., "Total Incendios")
            await page.waitForFunction(
                () => document.body.innerText.includes("Total Incendios"),
                { timeout: 30000 }
            );

            // Extract data by finding text nodes and looking near them
            const data = await page.evaluate(() => {
                const bodyText = document.body.innerText;

                // Helper to extract number after a keyword if they appear in sequence
                // Note: This matches the "investigated" structure where text is clumped
                const extractStat = (label: string) => {
                    // Simple regex attempt first (Label followed by number)
                    // This is fragile but works on text dumps
                    const regex = new RegExp(`${label}\\s*\\n*\\s*([\\d,.]+)`);
                    const match = bodyText.match(regex);
                    return match ? match[1] : "N/A";
                };

                // More robust approach: Find element with text, getting the next sibling or parent's value
                // Based on research, "En Combate" is a label, the number is likely in a sibling div

                // Let's use the TreeWalker approach from research which was robust
                const findValueForLabel = (label: string) => {
                    // @ts-ignore: NodeFilter is available in browser context
                    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                    let node;
                    while (node = walker.nextNode()) {
                        if (node.textContent?.includes(label)) {
                            // Start looking forward for a number
                            let nextNode = walker.nextNode();
                            for (let i = 0; i < 10; i++) { // check next 10 nodes
                                if (nextNode && nextNode.textContent && /^[\d,.]+$/.test(nextNode.textContent.trim())) {
                                    return nextNode.textContent.trim();
                                }
                                nextNode = walker.nextNode();
                            }
                        }
                    }
                    return "N/A";
                };

                return {
                    total: findValueForLabel("Total Incendios"),
                    en_combate: findValueForLabel("En Combate"),
                    controlado: findValueForLabel("Controlado"),
                    bajo_observacion: findValueForLabel("Bajo observación"),
                    // Fallback for demo if scraper fails due to layout shift
                    // timestamp: new Date().toISOString()
                };
            });

            return data;

        } catch (error) {
            console.error("Error scraping CONAF Power BI:", error);
            return { error: "Failed to scrape data" };
        } finally {
            if (browser) await browser.close();
        }
    }
}
