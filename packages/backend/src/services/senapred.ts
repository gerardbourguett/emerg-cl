import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

export class SenapredService {
    /**
     * Scrapes Albergues from static HTML (Elementor table)
     * URL: https://senapred.cl/albergues-emergencia/
     */
    static async getAlbergues() {
        try {
            const response = await fetch("https://senapred.cl/albergues-emergencia/");
            const html = await response.text();
            const $ = cheerio.load(html);

            const albergues: any[] = [];

            // Select rows in the table body. 
            // Note: Elementor tables can be nested or have specific classes, 
            // broad selection 'table tbody tr' is usually safe for this simple page.
            $("table tbody tr").each((_, row) => {
                const cols = $(row).find("td");
                if (cols.length > 0) {
                    albergues.push({
                        region: $(cols[0]).text().trim(),
                        provincia: $(cols[1]).text().trim(),
                        comuna: $(cols[2]).text().trim(),
                        lugar: $(cols[3]).text().trim(),
                        direccion: $(cols[4]).text().trim(),
                        capacidad: $(cols[5]).text().trim(),
                        estado: $(cols[6]).text().trim(),
                    });
                }
            });

            // Filter out header rows if they got caught (usually they are in thead but sometimes in tbody)
            return albergues.filter(a => a.region !== "Región" && a.region !== "");
        } catch (error) {
            console.error("Error scraping albergues:", error);
            return [];
        }
    }

    /**
     * Scrapes Events/Alerts using Puppeteer (Dynamic React App)
     * URL: https://senapred.cl/eventos/
     */
    static async getEvents() {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Block resources to speed up loading
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto("https://senapred.cl/alertas/", { waitUntil: "networkidle2" });

            // Wait for the dynamic content to appear
            await page.waitForSelector('.amplify-link', { timeout: 10000 });

            // Extract data from the DOM
            const events = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.amplify-link'));
                return items.map((item) => {
                    const titleElement = item.querySelector('p');
                    const dateElement = item.querySelectorAll('p')[1]; // usually the second p tag is the date

                    return {
                        title: titleElement ? titleElement.innerText : "Sin título",
                        fecha: dateElement ? dateElement.innerText : "",
                        url: item.getAttribute('href') ? "https://senapred.cl" + item.getAttribute('href') : ""
                    };
                });
            });

            return events;

        } catch (error) {
            console.error("Error scraping events:", error);
            return [];
        } finally {
            if (browser) await browser.close();
        }
    }
}
