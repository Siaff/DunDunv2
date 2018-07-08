const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
const DBL = require("dblapi.js");
const notams = require('notams');

// const fs = require('fs');
const bot = new Discord.Client();
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzNjQwNjEwNjAxMzgyNzA3MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTMwNjI1Nzg1fQ.b3jqwLoTxGjdgBk6LNjl2Y_MQSZixKzfVY9rsFuCrN0', bot);
// Server counts for discordbots website.
dbl.on('posted', () => {
});
dbl.on('error', e => {
   console.log(`Oops! ${e}`);
});

// Prefix
const prefix = '+';

// By using moment we get the Zulu time.
let time = moment.utc();
let timeform = time.format('YYYY-MM-DD HH:mm:ss Z');
let timeform2 = time.format('HH:mm:ss Z');
let timeform3 = time.format('DD/MM HH:mm');

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

// Makes the bot not crash.
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));


bot.on('guildCreate', guild => {
    console.log('New Guild added!');
});

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
        console.log(`METAR for ${args} by ${message.author.tag}`);
        let argz = args.map(e=>e.toUpperCase());
        let reqURL = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
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

    // TAF Command
    // https://avwx.rest/api/taf/EKCH?options=summary
    if (cmd == `${prefix}taf`) {
        console.log(`TAF for ${args} by ${message.author.tag}`);
        let argz = args.map(e=>e.toUpperCase());
        let reqURL = `https://avwx.rest/api/taf/${argz}?options=summary`;
        message.channel.startTyping(true);
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.stopTyping(true);
        let TAFEmbed = new Discord.RichEmbed()
            .setTitle(`TAF for ${json.Station}`)
            .setColor([99, 154, 210])
            .addField('Raw Report', `${json.RawReport}`, true)
            .addBlankField(true)
            .addField('Readable', `${json.Forecast[0].Summary}`, true)
        message.channel.send(TAFEmbed);
    }

    // NOTAM Command
    if (cmd == `${prefix}notam`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log(`NOTAM for ${argz} by ${message.author.tag}`)
        message.channel.startTyping(true)
        notams(`${argz}`, { format: 'DOMESTIC' }).then(result => {
            let notamEmbed = new Discord.RichEmbed()
            .setTitle(`${result[0].icao}'s NOTAMs`)
            .setColor([99, 154, 210])
            .addField('Notam', `${result[0].notams[1]}`, true)
            // message.channel.send(`\`\`\`${result[0].notams[1]} \`\`\``);
            message.channel.send(notamEmbed);
            message.channel.stopTyping(true);
        });
    }

    // ICAO Command
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if (cmd == `${prefix}icao`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log(`Checking ICAO for ${argz} by ${message.author.tag}`);
        let reqURL = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.send(`${json.Info.ICAO}'s full name is \`\`${json.Info.Name}\`\``);
    }

    // Ping Command to check connection.
    if (cmd == `${prefix}ping`) {
        console.log(`Pong! For ${message.author.tag}`);
        const editMsg = await message.channel.send('Why would you ping me?');
        let pingEmbed = new Discord.RichEmbed()
            .setTitle('🏓 Pong!')
            .setColor([53, 254, 75])
            .addField('Roundtrip', `${editMsg.createdTimestamp - message.createdTimestamp}ms`, true)
            .addField('Heartbeat', `${~~bot.ping}ms`, true);
        editMsg.edit(pingEmbed);
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
        .setColor([101, 244, 66])
        .setDescription(`\`\`\`${days} Days, ${hours} hrs, ${minutes} mins, ${~~seconds} secs.\`\`\``)
        .setFooter('Wowie, maybe this is the longest time ol\' Dun-Dun has been up?!?!?!!');
        console.log(`Uptime: ${hours}, ${minutes}, ${~~seconds} by ${message.author.tag}`);
        message.channel.send(uptimeEmbed);
    }
    
    // Info Command
    if (cmd == `${prefix}info`) {
        console.log(`Info for ${message.author.tag}`);
        let infoEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun Information.')
        .setColor([55, 213, 252])
        .setDescription('Dun-Dun is a small Aviation bot that is mostly focused around weather (METAR & TAF) but also NOTAMs. Dun-Dunv2 is made in discord.js 11.3.2.')
        .addField('Prefix', '+', true)
        .addField('Getting started', '+help', true)
        .addField('Join the support server!', '[By clicking here!](https://discord.gg/wf64e98)', true)
        .addField('Please vote for the bot !', '[By clicking here!](https://discordbots.org/bot/436406106013827072/vote)', true)
        .setFooter('Bot made by Siaff#3293');
        message.channel.send(infoEmbed);
    }

    // Help Command.
    if (cmd == `${prefix}help`) {
        console.log('Helping ' + message.author.tag);
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun to the rescue!')
        .setColor([43, 43, 255])
        .addField('+help', 'This command...', true)
        .addBlankField(true)
        .addField('+info', 'Gives some information about the bot.', true)
        .addField('+metar [ICAO]', 'Example \'+metar EKCH\'. Gives you live METAR of any airport.', true)
        .addField('+taf [ICAO]', 'Example \"+metar EKC\". Gives you live TAF of any airport.', true)
        .addField('+notam [ICAO]', 'Example \"+notam EKCH\". Gives you live NOTAMs of any airport', true)
        .addField('+icao', 'If you supply an ICAO after the command it will give the Airports name.', true)
        .addField('+utc', 'Gives you the UTC time in a 24-hour format.', true)
        .addField('+invite', 'Gives you a link to invite the bot, also an invite to the Dun-Dunv2 support server.', true)
        .addField('+uptime', 'Gives you the uptime of the bot.', true)
        .addBlankField(true)
        .addField('+ping', 'Pings the bot and gives you the bots ping.', true)
        .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(helpEmbed);
    }

    if (cmd == `${prefix}invite`) {
        console.log(`Sent an invite to ${message.author.tag}`);
        let inviteEmbed = new Discord.RichEmbed()
        .setTitle('Want me in your server?')
        .setColor([74, 216, 126])
        .addField('Invite link:', '[Click here to invite the Bot!](https://discordapp.com/oauth2/authorize?client_id=436406106013827072&permissions=37219392&scope=bot)', true)
        .addBlankField(true)
        .addField('Support server:', '[Click here for Support Server!](https://discord.gg/wf64e98)', true)
        message.channel.send(inviteEmbed);
    }

    // Purge Command up to a 100.	
    if(cmd == `${prefix}purge`) {
        // Checks server id. So it only works in Unga Flygare.
        if (message.guild.id != '380414605744275456') return message.channel.send('Shhhh, this only works in Siaffs private server!');
        if (isNaN(args)) return message.channel.send('**Please supply a valid amount of messages to purge**');	
        if (args > 100) return message.channel.send('**Please supply a number less than 100**');	
        // Logging	
        console.log(`Purged ${args} messages. Purge done by: ${message.author.tag}`);	
        let argz = Number(args);	
        message.channel.bulkDelete(argz + 1)
        .then(messages => message.channel.send(`**Successfully deleted \`${messages.size - 1}/${args[0]}\` messages**`)	
        .then(message => message.delete(10000)));	
    }
    
    if (cmd == `${prefix}users`) {
        console.log(`User checked by ${message.author.tag}`);
        if (message.guild.id != '380414605744275456') return message.channel.send('Shhhh, this only works in Siaffs private server!');
        let usersEmbed = new Discord.RichEmbed()
    }

    if (cmd == `${prefix}utc`) {
        console.log(`UTC given to ${message.author.tag}`);
        let utcEmbed = new Discord.RichEmbed()
            .setTitle('UTC Time')
            .setDescription(`${timeform3} UTC`)
            .setColor([101, 244, 66])
        message.channel.send(utcEmbed);
    }
});

// Login key for Dun Dunv2
// Token Removed.