# meterconnex-usage-reporter

Script to read the percentage change from provident meterconnex's website. Currently messages the result over telegram via the telegram adapter. Any other adapters should implement the sendMessage method, then can be swapped out easily in `index.js`. The default implementation simply changes the period of time to day and reads the percentage increase/decrease compared to the previous day.

## Usage

Set the appropriate environment variables in the `.env`.
```
# meterconnex login info
LOGIN=
PASSWORD=

# vars for telegram adapter
TELEGRAM_TOKEN=
CHAT_ID=

```
Create a cronjob to either run `node index.js` or `docker run` periodically
