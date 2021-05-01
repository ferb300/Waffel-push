import puppeteer from "puppeteer-core";

async function click(page, identifier) {
    return Promise.all([
        page.waitForNavigation("networkidle0"),
        page.click(identifier),
    ]);
}

export async function getExercise(addrinfo) {
    let browser = await puppeteer.connect({ browserURL: `http://${addrinfo.address}:9222` })
    let page = await browser.newPage();
    await page.goto(process.env.WAFFEL_BASE_URL + '/login');

    // login
    console.log("Logging in")
    await page.type('#password', process.env.WAFFEL_PASSWORD);
    await page.type('#username', process.env.WAFFEL_USERNAME);
    await click(page, "#submit")

    // load exercise
    // TODO: Check if this gets the correct exercise if there are multiple present
    console.log("Getting exercise")
    await click(page, "#profile")
    let exercise = await page.evaluate(() => {
        let t = document.querySelector("main").children[2].children[1].children[0].children[1]
        return {
            course: t.children[0].innerText,
            name: t.children[2].innerText,
            result: t.children[3].innerText
        }
    })

    // logout
    console.log("Logging out")
    await click(page, "#logout")
    await page.close();
    await browser.disconnect();
    
    return exercise
}