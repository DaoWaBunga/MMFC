const TelegramBot = require('node-telegram-bot-api');
const token = '7314565544:AAGftUX3GuikoIbnVlY9uZiU-b45VQQM0jI';  // Replace with your bot token
const bot = new TelegramBot(token, { polling: true });

// URL of your hosted Phaser game
const gameUrl = 'https://daowabunga.github.io/MMFiend_clicker_crack';  // Replace with the actual URL

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const responseMessage = `Welcome to MMFiends Clicker Crack! You can play the game [here](${gameUrl}).`;
  bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
});

// Add more bot handlers as needed
