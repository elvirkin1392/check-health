# check-health
Health tracker Web app with a Telegram bot integration 

Purpose:
Collect data of diseases, medical tests, show statistics

![web - main page](https://github.com/user-attachments/assets/9554f2a0-a78c-43c4-bf95-01c1bc054e3d)
![mobile - login](https://github.com/user-attachments/assets/4ec68182-51a5-4eb5-b049-e989ac92ad8d)

## Links

- https://tlgrm.ru/docs/bots/api
- https://cloud.google.com/run/?hl=en
- https://console.cloud.google.com/


##Install

###Web
cd client/
cp .env.template .env # only first time, fill created file with relevant variables
npm install # only first time or after dependencies updates
npm run dev

###Server
cp .env.template .env # only first time, fill created file with relevant variables
npm install # only first time or after dependencies updates
npm run dev
