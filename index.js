const TelegramBot = require('node-telegram-bot-api');

const BASE_URL = 'http://api.weatherapi.com/v1';
const WEATHER_API_KEY = 'b56c589477474d5988b142339242110';
//здесь добавить токен вашего бота
const TOKEN_BOT = '';
const WEATHER_FORMAT = 'current.json';

const bot = new TelegramBot(TOKEN_BOT, { polling: true });

bot.onText(/\/start/, msg => {
  bot.sendMessage(
    msg.chat.id,
    'Напишите название города, погоду которого хотите узнать',
  );
});

bot.on('text', async msg => {
  if (msg.text.startsWith('/')) return;

  const containsOnlyLetters = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(msg.text);

  if (!containsOnlyLetters) {
    bot.sendMessage(msg.chat.id, 'Вам нужно ввести правильное название города');
  } else {
    const { data, ok } = await getWeatherInfo(msg.text);

    if (!ok) {
      bot.sendMessage(
        msg.chat.id,
        'Извините что то пошло не так, проверьте корректность города или попробуйте позже',
      );
      return;
    }

    bot.sendMessage(
      msg.chat.id,
      `<b>Страна: ${data.location.country}</b> \n <b>Город: ${data.location.name}</b> \n <b>Температура по цельсию: ${data.current.temp_c}</b> \n <b>Температура по фаренгейту: ${data.current.temp_f}</b>`,
      { parse_mode: 'HTML' },
    );
  }
});

async function getWeatherInfo(city) {
  try {
    const response = await fetch(
      `${BASE_URL}/${WEATHER_FORMAT}?key=${WEATHER_API_KEY}&q=${city}`,
    );
    console.log('res', response);

    if (!response.ok) {
      return { ok: false };
    }

    const data = await response.json();

    return { data, ok: true };
  } catch (error) {
    console.log(error);
  }
}
