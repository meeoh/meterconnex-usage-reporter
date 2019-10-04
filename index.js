require("dotenv").config();

const puppeteer = require("puppeteer");

const { LOGIN: login, PASSWORD: password, CHROME_PATH: chromePath } = process.env;

const required = ["LOGIN", "PASSWORD"];
if (!login || !password) {
  const missing = [];
  required.forEach(k => (!process.env[k] ? missing.push(k) : null));
  console.log(`Missing ${missing.join(", ")}`);
  process.exit();
}

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

const messenger = require("./telegram_adapter");

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath || 'chrome' });
  const page = await browser.newPage();
  try {
    await page.goto(
      "https://provident.meterconnex.com/secure/Dashboard/Dashboard.aspx"
    );
    await page
      .waitForSelector("#ctl01_MasterContentPlaceHolder1_txtUserID")
      .then(async () => {
        await page.focus("#ctl01_MasterContentPlaceHolder1_txtUserID");
        await page.keyboard.type(login);
      });
    await page
      .waitForSelector("#ctl01_MasterContentPlaceHolder1_txtPassword")
      .then(async () => {
        await page.focus("#ctl01_MasterContentPlaceHolder1_txtPassword");
        await page.keyboard.type(password);
        await page.keyboard.press("Enter");
      });
    await delay(3000);
    await page
      .waitForSelector("#ctl01_MasterContentPlaceHolder1_cbPeriod_Input")
      .then(async el => {
        el.click();
        await delay(3000);
        await page.click(
          "#ctl01_MasterContentPlaceHolder1_cbPeriod_DropDown li:first-child"
        );
      });

    await delay(3000);
    await page
      .waitForSelector("#ctl01_MasterContentPlaceHolder1_lblChangeNumber")
      .then(async el => {
        const percentage = await page.evaluate(
          element => element.textContent,
          el
        );
        const changeTypeElm = await page.$(
          "#ctl01_MasterContentPlaceHolder1_lblChangeDirection"
        );
        const changeType = await page.evaluate(
          element => element.textContent,
          changeTypeElm
        );
        messenger.sendMessage(
          `Compared to yesterday, electricity has ${changeType.toLowerCase()} ${percentage}`
        );
      });
    browser.close();
  } catch (e) {}
})();
