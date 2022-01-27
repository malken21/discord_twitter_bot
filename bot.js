
const { Client, Intents} = require("discord.js");
const Discord_client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

let Discord_bot = false;

const fs = require("fs");
const https = require('https');
const cron = require('node-cron');

const Config = require("./Config.json")

const Twitter_TOKEN = {
  headers: {
    "Authorization" : `Bearer ${Config.Bearer_TOKEN}`
  }
};

Discord_client.login(Config.Discord_TOKEN);

Discord_client.on('ready', () => {
  Discord_bot = true;
  console.log(`login!!(${Discord_client.user.tag})`);
});

cron.schedule(Config.Cron_Time, () => {
  https.get(`https://api.twitter.com/2/users/${Config.Twitter_User_ID}/tweets?max_results=5&expansions=referenced_tweets.id,author_id`,Twitter_TOKEN, (res) => {
    res.on('data', (data) => {
      let timelines = JSON.parse(data);

      console.log(timelines);

      if(fs.readFileSync('./Last_tweet.json', 'utf8')!=timelines.data[0].id && !timelines.data[0].referenced_tweets && timelines.data[0].text.indexOf(Config.tag)!= -1 & Discord_bot == true){//もし最新のツイートが前と変わっている & そのツイートはリツイートじゃない & Config.jsonで指定したハッシュタグが付いている & ディスコ―ドのボットがオンラインになっている(エラー回避)
        fs.writeFileSync('./Last_tweet.json',timelines.data[0].id, 'utf8');
        Discord_client.guilds.cache.get(Config.ServerID).channels.cache.get(Config.ChannelID).send(`https://twitter.com/${timelines.data[0].author_id}/status/${timelines.data[0].id}`);
      };
    });
  });
})