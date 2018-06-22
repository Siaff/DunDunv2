const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
const bot = new Discord.Client();

// Prefix for .toLowerCase();.
const prefix = '!';

// By using moment we get the Zulu time.
let time = moment.utc();
let timeform = time.format('YYYY-MM-DD HH:mm:ss Z');
let timeform2 = time.format('HH:mm:ss Z');

    // Console loggers for when the bot connects.
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log('Connecting...');

// Functions
function fixKeys(json) {
    if (typeof(json) !== "object") {
        return json;
    }
    let keys = Object.keys(json);
    let result = {};
    keys.forEach((key) => {
        let cleanKey = key.replace(/-/g, "");
        result[cleanKey] = fixKeys(json[key]);
    });
    return result;
}


// Logging and actions when bot is ready to use.
bot.on('ready', () => {
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log(`
        _____                _____               __      _____  
        |  __ \\              |  __ \\              \\ \\    / /__ \\ 
        | |  | |_   _ _ __   | |  | |_   _ _ __    \\ \\  / /   ) |
        | |  | | | | | '_ \\  | |  | | | | | '_ \\    \\ \\/ /   / / 
        | |__| | |_| | | | | | |__| | |_| | | | |    \\  /   / /_ 
        |_____/ \\__,_|_| |_| |_____/ \\__,_|_| |_|     \\/   |____|
                                                                 
                                                                 `);
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log('Connection Time                                   ' + timeform);
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    // Sets activity
    bot.user.setActivity('PornHub', {type: 'WATCHING'});
});
// For when someone sends a message
bot.on('message', async message => {
    // Regular things so it won't respond to itself nor work in DMs.
    if (message.author.bot) return;
     
    // Defining msg and args
    let messageArray = message.content.split(' ');
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    // Here comes the commands!
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Metar Command
    if(cmd == `${prefix}metar`) {
        let reqURL = `https://avwx.rest/api/metar/${args}?options=info,translate,speech`;
        message.channel.startTyping(true);
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.stopTyping(true);
        let METAREmbed = new Discord.RichEmbed()
            .setTitle(`${json.Info.City}, ${json.Info.Name} – ${json.Info.ICAO}`)
            .setColor([93, 233, 235])
            .addField('Readable Report:', `${json.Speech}`, true)
            .addField('RAW Report:',`${json.RawReport}`, true)
            .addField('Flight Rule:', `${json.FlightRules}`, true)
            .addField('Time of Report', `${json.Meta.Timestamp}`, true)
            .addBlankField(true)
            .addField('Wind', `${json.WindDirection} at ${json.WindSpeed} ${json.Units.WindSpeed}`, true)
            .addField('Visibility', `${json.Translations.Visibility}`, true)
            .addField('Clouds:', `${json.Translations.Clouds}`, true)
            .addField('Temperature:', `${json.Translations.Temperature}`, true)
            .addField('Dewpoint:', `${json.Translations.Dewpoint}`, true)
            .addField('QNH:', `${json.Translations.Altimeter}`, true)
            .addField('Remarks:', `${json.Remarks}`, true)
            .setFooter(`Requested at ${timeform2}`);
        message.channel.send(METAREmbed);
    }

    // Purge Command up to a 100.
    if(cmd == `${prefix}purge`) {
        if (isNaN(args)) return message.channel.send('**Please supply a valid amount of messages to purge**');
        if (args > 100) return message.channel.send('**Please supply a number less than 100**');
        let argz = Number(args);
		message.channel.bulkDelete(argz + 1)
            .then(messages => message.channel.send(`**Successfully deleted \`${messages.size - 1}/${args[0]}\` messages**`)
            .then(message => message.delete(10000)));
    }

    // Ping Command to check connection.
    if (cmd == `${prefix}ping`) {
        const editMsg = await message.channel.send('🏓 Ping???');
        editMsg.edit(`🏓 Pong! (Roundtrip: ${editMsg.createdTimestamp - message.createdTimestamp}ms | Heatbeat ${~~bot.ping}ms)`);
   }

   // Uptime Command to check how long the bot hasa been up!
    if (cmd == `${prefix}uptime`) {
        let totalSeconds = (bot.uptime / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let uptime = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
        message.channel.send(uptime);
    }
});

// Login key for Dun Dunv2
bot.login('NDM2NDA2MTA2MDEzODI3MDcy.DgLuxw.eqknDKJR0sBRRaFF1e1ZYZXs-_k');