# check-health
Health tracker Web app with a Telegram bot integration 

Purpose:
Collect data of diseases, medical tests, show statistics

<img src="https://github.com/user-attachments/assets/2684d6db-9d10-4bd3-accf-0d105a9cf46e" width="550"/> <img src="https://github.com/user-attachments/assets/4ec68182-51a5-4eb5-b049-e989ac92ad8d" width="140"/>


## Links

- https://tlgrm.ru/docs/bots/api
- https://cloud.google.com/run/?hl=en
- https://console.cloud.google.com/


## Install

### Web
cd client/
cp .env.template .env # only first time, fill created file with relevant variables
npm install # only first time or after dependencies updates
npm run dev

### Server
cp .env.template .env # only first time, fill created file with relevant variables
npm install # only first time or after dependencies updates
npm run dev
