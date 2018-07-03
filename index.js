const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
// const fs = require('fs');
const bot = new Discord.Client();

// Prefix for .toLowerCase();.
const prefix = '+';

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
    bot.user.setActivity('the weather || +info', {type: 'WATCHING'});
});
// For when someone sends a message
bot.on('message', async message => {

    // Regular things so it won't respond to itself nor work in DMs.
    if (message.author.bot) return;

    // Defining msg and args
    let msgArr = message.content.split(' ');
    let cmd = msgArr[0];
    let args = msgArr.slice(1);

    // Here comes the commands!
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Metar Command
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if(cmd == `${prefix}metar`) {
        console.log(`METAR for ${args}`);
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
            .addBlankField(true)
            .addField('Time of Report', `${json.Meta.Timestamp}`, true)
            .addField('Wind', `${json.WindDirection} at ${json.WindSpeed} ${json.Units.WindSpeed}`, true)
            .addField('Visibility', `${json.Translations.Visibility}`, true)
            .addField('Clouds:', `${json.Translations.Clouds}`, true)
            .addField('Temperature:', `${json.Translations.Temperature}`, true)
            .addField('Dewpoint:', `${json.Translations.Dewpoint}`, true)
            .addField('QNH:', `${json.Translations.Altimeter}`, true)
            .addField('Remarks:', `${json.Remarks}` || 'NOSIG', true)
            .setFooter(`Requested at ${timeform2}`);
        message.channel.send(METAREmbed);
    }

    // TAF Command [WIP]
    // https://avwx.rest/api/taf/EKCH?options=info,translate,speech
    /*
    if (cmd == `${prefix}taf`) {
        console.log(`TAF for ${args}`);
        let tafReqURL = `https://avwx.rest/api/taf/${args}?options=info,translate,speech`;
        message.channel.startTyping(true);
        let tafResponse = await fetch(tafReqURL);
        let tafJson = fixKeys(await tafResponse.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.stopTyping(true);
        let TAFEmbed = new Discord.RichEmbed()
            .addTitle(``)
    }
    */

    // ICAO Command [WIP]
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if (cmd == `${prefix}icao`) {
        console.log(`Checking ICAO for ${args}`);
        let reqURL = `https://avwx.rest/api/metar/${args}?options=info,translate,speech`;
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.send(`${json.Info.ICAO}'s full name is \`\`${json.Info.Name}\`\``);
    }


    // Purge Command up to a 100.
    if(cmd == `${prefix}purge`) {
        // Checks server ids.
        // Idiots Guide showcase.
        if (message.guild.id == '463226021882363914') return console.log('Someone tried to purge in Idiots Bot Server');
        // Discord Bot List server. 
        if (message.guild.id == '264445053596991498') return console.log('Someone tried to purge Discord Bot Lists Server.');

        if (isNaN(args)) return message.channel.send('**Please supply a valid amount of messages to purge**');
        if (args > 100) return message.channel.send('**Please supply a number less than 100**');
        // Logging
        console.log(`Purged ${args} messages`);
        let argz = Number(args);
		message.channel.bulkDelete(argz + 1)
            .then(messages => message.channel.send(`**Successfully deleted \`${messages.size - 1}/${args[0]}\` messages**`)
            .then(message => message.delete(10000)));
    }

    // Ping Command to check connection.
    if (cmd == `${prefix}ping`) {
        console.log('Pong!');
        const editMsg = await message.channel.send('Why would you ping me?');
        editMsg.edit(`Pong! Roundtrip: ${editMsg.createdTimestamp - message.createdTimestamp}ms, heatbeat ${~~bot.ping}ms`);
   }

   // Uptime Command to check how long the bot hasa been up!
    if (cmd == `${prefix}uptime`) {
        let totalSeconds = (bot.uptime / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let days = Math.floor(totalSeconds / 86400);
        let uptimeEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Duns Uptime')
        .setDescription(`\`\`\`${days} Days, ${hours} hrs, ${minutes} mins, ${~~seconds} secs.\`\`\``)
        .setFooter('Wowie, maybe this is the longest time ol\' Dun-Dun has been up?!?!?!!');
        console.log(`Uptime: ${hours}, ${minutes}, ${~~seconds}`);
        message.channel.send(uptimeEmbed);
    }
    
    // Info Command
    if (cmd == `${prefix}info`) {
        console.log('Info');
        let infoEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun Information.')
        .setColor([55, 213, 252])
        .setDescription('Dun-Dun is a small Aviation bot that is mostly focused around weather.')
        .addField('Prefix:', '+', true)
        .addField('Getting started', '+help', true)
        .setFooter('Bot made by Siaff#3293');
        message.channel.send(infoEmbed);
    }

    // Help Command.
    if (cmd == `${prefix}help`) {
        console.log('Helping');
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun to the rescue!')
        .setColor([43, 43, 255])
        .addField('+help', 'This command...', true)
        .addBlankField(true)
        .addField('+info', 'Gives some information about the bot.', true)
        .addField('+metar [ICAO]', 'Example \'+metar EKCH\'. Gives you METAR of any airport.', true)
        .addField('+uptime', 'Gives you the uptime of the bot.', true)
        .addBlankField(true)
        .addField('+ping', 'Pings the bot and gives you the bots ping.', true)
        .addField('+purge', 'Purges messages if it has perms to do it.', true)
        .addField('+icao', 'If you supply an ICAO after the command it will give the Airports name.', true)
        .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(helpEmbed);
    }
});

// Login key for Dun Dunv2
bot.login('Token Removed.');