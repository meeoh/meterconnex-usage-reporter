require("dotenv").config();

const { Builder, By, Key, until } = require("selenium-webdriver");
const { LOGIN: login, PASSWORD: password } = process.env;

const required = ["LOGIN", "PASSWORD"];
if (!login || !password) {
  const missing = [];
  required.forEach(k => (!process.env[k] ? missing.push(k) : null));
  console.log(`Missing ${missing.join(", ")}`);
  process.exit();
}

const messenger = require("./telegram_adapter");

let driver;

async function setToDay() {
  await driver
    .wait(
      until.elementLocated(
        By.id("ctl01_MasterContentPlaceHolder1_cbPeriod_Input")
      ),
      5 * 1000
    )
    .then(el => {
      el.click();
    });
  await driver.sleep(5000);
  await driver
    .wait(
      until.elementLocated(
        By.css(
          "#ctl01_MasterContentPlaceHolder1_cbPeriod_DropDown li:first-child"
        )
      ),
      5 * 1000
    )
    .then(el => {
      el.click();
    });
}

(async function example() {
  driver = await new Builder().forBrowser("firefox").build();

  try {
    await driver.get(
      "https://provident.meterconnex.com/secure/Dashboard/Dashboard.aspx"
    );
    await driver
      .wait(
        until.elementLocated(
          By.id("ctl01_MasterContentPlaceHolder1_txtUserID")
        ),
        5 * 1000
      )
      .then(el => {
        return el.sendKeys(login);
      });
    await driver
      .wait(
        until.elementLocated(
          By.id("ctl01_MasterContentPlaceHolder1_txtPassword")
        ),
        5 * 1000
      )
      .then(async el => {
        await el.sendKeys(password);
        await el.sendKeys(Key.ENTER);
      });

    await driver.sleep(5000);

    await setToDay();

    await driver.sleep(5000);

    await driver
      .wait(
        until.elementLocated(
          By.id("ctl01_MasterContentPlaceHolder1_lblChangeNumber")
        ),
        5 * 1000
      )
      .then(async el => {
        const changeType = await driver
          .findElement(
            By.id("ctl01_MasterContentPlaceHolder1_lblChangeDirection")
          )
          .getText();
        const percentage = await el.getText();
        messenger.sendMessage(
          `Compared to yesterday, electricity has ${changeType.toLowerCase()} ${percentage}`
        );
      });
  } catch (e) {
    messenger.sendMessage(
      `Compared to yesterday, electricity has ${changeType.toLowerCase()} ${percentage}`
    );
  } finally {
    await driver.quit();
  }
})();
