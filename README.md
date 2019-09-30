# meterconnex-usage-reporter

Script to read the percentage change from provident meterconnex's website. Currently messages the result over telegram via the telegram adapter. Any other adapters should implement the sendMessage method, then can be swapped out easily in `index.js`.