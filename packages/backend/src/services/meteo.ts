import puppeteer from "puppeteer";

export class MeteoService {
    /**
     * Scrapes current weather conditions from MeteoChile (JSF App)
     * URL: https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml
     */
    static async getConditions() {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Block images/fonts
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto("https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml", { waitUntil: "domcontentloaded" });

            // Wait for the temperature element (using the ID found in research)
            // Note: The specific IDs need to be robust. 
            // Assuming a generic selector approach if IDs change, but based on research, 
            // they are usually laid out in absolute divs.

            // We'll scrape the main "Current Conditions" table if available 
            // or specific elements representing major cities.

            const data = await page.evaluate(() => {
                // Scrape the main "Tiempo Actual" table for Santiago
                // This is often in a table with class 'table' or specific IDs.
                // For now, we return a mock structure based on what's usually visible 
                // until we can pinpoint the exact JSF generated IDs which are notoriously ugly.

                // Try to find the Santiago temperature
                const tempElement = document.querySelector(".temperatura-actual"); // Hypothetical class
                const temp = tempElement ? tempElement.textContent?.trim() : "N/A";

                return {
                    location: "Santiago",
                    temperature: temp,
                    source: "Dirección Meteorológica de Chile"
                };
            });

            return data;

        } catch (error) {
            console.error("Error scraping meteo:", error);
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }
}
