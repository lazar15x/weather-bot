const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const baseURL = 'http://api.weatherapi.com/v1';
const weatherFormat = 'current.json';

const bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true });

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
      `${baseURL}/${weatherFormat}?key=${process.env.WEATHER_API_KEY}&q=${city}`,
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
