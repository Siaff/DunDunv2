const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
const DBL = require('dblapi.js');
const notams = require('notams');
// Cheerio wip.
const cheerio = require('cheerio');

// const fs = require('fs');
const bot = new Discord.Client();

// Tokens
let dblToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzNjQwNjEwNjAxMzgyNzA3MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTMwNjI1Nzg1fQ.b3jqwLoTxGjdgBk6LNjl2Y_MQSZixKzfVY9rsFuCrN0';
let dunDunToken = 'NDE2NjkzNzMwNDkwMzE4ODQ4.DmaxjA._lCw3URQzfWqUUkV8tcv6b2p-O8';
let dunDunv2Token = 'NDM2NDA2MTA2MDEzODI3MDcy.DmUlXg.YoMGAN2fdvsPm7_4cc-eP1iAgG0';
// Removed

// Prefix
const prefix = '+';

// By using moment we get the Zulu time.
let time = moment.utc();
let timeform = time.format('YYYY-MM-DD HH:mm:ss Z');
let timeform2 = time.format('HH:mm:ss'); // Not used atm.

    // Console loggers for when the bot is connecting.
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log('Connecting...');

// Functions
function fixKeys(json) {
    if (typeof(json) !== 'object') {
        return json;
    }
    let keys = Object.keys(json);
    let result = {};
    keys.forEach((key) => {
        let cleanKey = key.replace(/-/g, '');
        result[cleanKey] = fixKeys(json[key]);
    });
    return result;
}

// Makes the bot not crash.
bot.on('error', (e) => console.error(e));
bot.on('warn', (e) => console.warn(e));

// Discord bot website token.
const dbl = new DBL(dblToken, bot);
dbl.on('posted', () => {});
dbl.on('error', e => {
   console.log(`Oops! ${e}`);
});

// When a new server gets added
bot.on('guildCreate', guild => {
    console.log(`New guild added ${guild.name}, (guilds id is ${guild.id}). The guild added has ${guild.memberCount} members!`);

    // Join message
    guild.channels.filter(c => c.type === 'text').first().send(`Hello **${guild.name}** and Thank you for choosing Dun-Dunv2 <:DunDunv2_Pfp2:479071322543226880>
:arrow_right: If you need any help with understand Dun-Dunv2 join the support server! https://discord.gg/wf64e98
:arrow_right: If you want to get started do **+info**
:arrow_right: To get all the commands do **+help**
:arrow_right: When using the METAR, TAF, ICAO, NOTAMs, Charts and Brief commands please give an **ICAO** for it to work, an **ICAO is always 4 letters** if it's a civil airport!
:arrow_right: Or join an awesome real world aviation community, based on Reddit\'s /r/flying subreddit!. https://discord.gg/fAwyC7X

*Best regards, Siaff#3293.*`).then(console.log(`Sent Hello Message to ${guild.name}.`));
});

bot.on('guildDelete', guild => {
    console.log(`Guild removed ${guild.name}, id is ${guild.id}. User size is now ${bot.users.size}`);
})

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
    let args = msgArr.slice(1);
    let cmdd = msgArr[0];
    let cmd = cmdd.toLowerCase();


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
        let optText = (truthy, ifTrue, ifFalse = '') => truthy ? ifTrue : ifFalse;
        // if (!gucci){
        //     return; // No gucci );
        // }
        if (json.Error) {
            let briefErrorEmbed = new Discord.RichEmbed()
                .setTitle(`${argz} is not a valid ICAO`)
                .setDescription('The bot might not be able to find it! The ICAO might not be in it\'s library or is not a valid ICAO')
                .addField('Quick Tip:', 'ICAOs almost always have four letters', true)
                .addBlankField(true)
                .addField('Example:', 'One example is **EKCH** for Copenhagen Airport', true)
                .setColor([255, 0, 0]);
            console.log('Oop something fucked up')
            message.channel.stopTyping(true);
            return message.channel.send(briefErrorEmbed);
        }
//         let METAREmbed = new Discord.RichEmbed()
//             .setTitle(`${json.Info.City}, ${json.Info.Name} – ${json.Info.ICAO}`)
//             .setColor([93, 233, 235])
//             .setDescription(`**Readable Report:**
// ${json.Speech}

// **Raw Report:**
// ${json.RawReport}

// **Flight Rule:** ${json.FlightRules}

// **Visibility:** ${json.Translations.Visibility}     
// **Wind:** ${json.WindDirection} at ${json.WindSpeed} ${json.Units.WindSpeed}

// **Clouds:** ${json.Translations.Clouds}

// **Temperature:** ${json.Translations.Temperature}
// **Dewpoint:** ${json.Translations.Dewpoint}

// **QNH:** ${json.Translations.Altimeter}

// **Remarks:** ${json.Remarks}`)
//             .addField('Time of Report', `${json.Meta.Timestamp}`, true)
//             .setFooter(`This is not a source for official weather briefing. Please obtain a weather briefing from the appropriate agency.`);
        let METAREmbed = new Discord.RichEmbed()
            .setTitle(`${json.Info.City}, ${json.Info.Name} – ${argz}`)
            .setColor([93, 233, 235])
            .addField('Raw Report – ', json.RawReport, true)
            .addField('Readable – ', json.Speech, true)
            .setFooter(`This is not a source for official weather briefing. Please obtain a weather briefing from the appropriate agency.`);
        message.channel.stopTyping(true);
        return message.channel.send(METAREmbed);
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
        let optText = (truthy, ifTrue, ifFalse = '') => truthy ? ifTrue : ifFalse;
        if (json.Error) {
            let briefErrorEmbed = new Discord.RichEmbed()
                .setTitle(`${argz} is not a valid ICAO`)
                .setDescription('The bot might not be able to find it! The ICAO might not be in it\'s library or is not a valid ICAO')
                .addField('Quick Tip:', 'ICAOs almost always have four letters', true)
                .addBlankField(true)
                .addField('Example:', 'One example is **EKCH** for Copenhagen Airport', true)
                .setColor([255, 0, 0]);
            message.channel.stopTyping(true);
            console.log('Oop something fucked up')
            return message.channel.send(briefErrorEmbed);
        }
        message.channel.stopTyping(true);
        let TAFEmbed = new Discord.RichEmbed()
            .setTitle(`TAF for ${json.Station}`)
            .setColor([99, 154, 210])
            .setDescription(`${json.RawReport}`)
            .addField('Readable', `${json.Forecast[0].Summary}`, true)
            .setFooter('This is not a source for official weather briefing. Please obtain a weather briefing from the appropriate agency.');
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
                .setDescription(`${result[0].notams[1]}`)
                .setFooter('This is not a source for official briefing. Please use the appropriate forums.');
            message.channel.stopTyping(true);
            return message.channel.send(notamEmbed);
        });
    }
    // http://vau.aero/navdb/chart/ESMS.pdf
    if (cmd == `${prefix}charts`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log(`Giving charts to ${message.author.tag}, Airport: ${argz}`);
        let chartsWebsiteLink = `http://vau.aero/navdb/chart/${argz}.pdf`;
        let chartsEmbed = new Discord.RichEmbed()
            .setDescription(`[Click here for ${argz} Charts](${chartsWebsiteLink})`)
            .setColor([99, 154, 210])
        message.channel.send(chartsEmbed);
    }

    // Breif command gives NOTAMS, TAF and METAR.
    if (cmd == `${prefix}brief`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log(`Briefing ${message.author.tag}, Airport: ${argz}`);
        let METARReqURL = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
        let TAFReqURL = `https://avwx.rest/api/taf/${argz}?options=summary`;
        let chartsURL = `http://vau.aero/navdb/chart/${argz}.pdf`
        message.channel.startTyping(true);
        let METARresponse = await fetch(METARReqURL);
        let METARjson = fixKeys(await METARresponse.json());
        let TAFresponse = await fetch(TAFReqURL);
        let TAFjson = fixKeys(await TAFresponse.json());
        let optText = (truthy, ifTrue, ifFalse = '') => truthy ? ifTrue : ifFalse;
        if (METARjson.Error) {
            let briefErrorEmbed = new Discord.RichEmbed()
                .setTitle(`${argz} is not a valid ICAO`)
                .setDescription('The bot might not be able to find it! The ICAO might not be in it\'s library or is not a valid ICAO')
                .addField('Quick Tip:', 'ICAOs almost always have four letters', true)
                .addBlankField(true)
                .addField('Example:', 'One example is **EKCH** for Copenhagen Airport', true)
                .setColor([255, 0, 0]);
            console.log('Oop someone fucked up!');
            message.channel.stopTyping(true);
            return message.channel.send(briefErrorEmbed);
        }
        notams(`${argz}`, { format: 'DOMESTIC' }).then(result => {
            let briefEmbed = new Discord.RichEmbed()
                .setTitle(`Brief for ${METARjson.Station}`)
                .addField('METAR', `${METARjson.RawReport}`, true)
                .addField('TAF', `${TAFjson.RawReport}`, true)
                .addField('NOTAM', `${result[0].notams[1]}`, true)
                .addField('Charts', `[Click here for ${argz} Charts](${chartsURL})`, true)
                .setFooter('This is not a source for official briefing. Please use the appropriate forums.')
                .setColor([135, 206, 250]);
            message.channel.stopTyping(true);
            return message.channel.send(briefEmbed); 
        });
    }

    // Raw Command. 
    if (cmd == `${prefix}raw`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log('Posting RAW for ' + message.author.tag + ' airport checked: ' + argz);
        let rawLink = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
        message.channel.startTyping(true);
        let rawResponse = await fetch(rawLink);
        let json = fixKeys(await rawResponse.json());
        let optText = (truthy, ifTrue, ifFalse = '') => truthy ? ifTrue : ifFalse;
        if (json.Error) {
            let rawErrorEmbed = new Discord.RichEmbed()
                .setTitle(`${argz} is not a valid ICAO`)
                .setDescription('The bot might not be able to find it! The ICAO might not be in it\'s library or is not a valid ICAO')
                .addField('Quick Tip:', 'ICAOs almost always have four letters', true)
                .addBlankField(true)
                .addField('Example:', 'One example is **EKCH** for Copenhagen Airport', true)
                .setColor([255, 0, 0]);
            console.log('Oop something fucked up')
            message.channel.stopTyping(true);
            return message.channel.send(rawErrorEmbed);
        }
        let rawEmbed = new Discord.RichEmbed()
            .setTitle('Raw METAR for ' + argz)
            .setDescription(json.RawReport) // For 2morrow when u arent dead inside...
            .setColor([99, 154, 210]);
        message.channel.stopTyping(true);
        message.channel.send(rawEmbed);
    }


    // ICAO Command
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if (cmd == `${prefix}icao`) {
        let argz = args.map(e=>e.toUpperCase());
        console.log(`Checking ICAO for ${argz} by ${message.author.tag}`);
        let reqURL = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        if (json.Error) {
            let briefErrorEmbed = new Discord.RichEmbed()
                .setTitle(`${argz} is not a valid ICAO`)
                .setDescription('The bot might not be able to find it! The ICAO might not be in it\'s library or is not a valid ICAO')
                .addField('Quick Tip:', 'ICAOs almost always have four letters', true)
                .addBlankField(true)
                .addField('Example:', 'One example is **EKCH** for Copenhagen Airport', true)
                .setColor([255, 0, 0]);
            console.log('Oop something fucked up')
            return message.channel.send(briefErrorEmbed);
        }
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.send(`${json.Info.ICAO}'s full name is \`\`${json.Info.Name}\`\``);
    }

    // Ping Command.
    if (cmd == `${prefix}ping`) {
        if (!message.author.id === '275701228422299648' || !message.author.id === '332956757800517640' || !message.author.id === '333305132739723275') {
            return message.channel.send('How do you know about this?!?!?!');
        }
        console.log(`Pong! For ${message.author.tag}`);
        let editMsg = await message.channel.send('Why would you ping me?');
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
        let uptimeEmbed = new Discord.RichEmbed()
            .setTitle('Dun-Duns Uptime')
            .setColor([101, 244, 66])
            .setDescription(`\`\`\`${hours} hrs, ${minutes} mins, ${~~seconds} secs.\`\`\``)
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
            .addField('Or invite the bot!', '[By clicking here!](https://discordapp.com/oauth2/authorize?client_id=436406106013827072&permissions=37219392&scope=bot)', true)
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
            .addField('+taf [ICAO]', 'Example \"+taf EKCH\". Gives you live TAF of any airport.', true)
            .addField('+notam [ICAO]', 'Example \"+notam EKCH\". Gives you live NOTAMs of any airport.', true)
            .addField('+charts [ICAO]', 'Example \”+charts EKCH\". Gives you up to date charts of chosen airport.', true)
            .addField('+brief [ICAO]', 'Example \"+brief EKCH\". Gives you METAR, TAF & NOTAMs of any aiport.', true)
            .addField('+raw [ICAO]', 'Example \"+raw EKCH\”. Gives you raw METAR & TAF of chosen airport.', true)
            .addField('+icao [ICAO]', 'Example \"+icao EKCH\". If you supply an ICAO after the command it will give the Airports name.', true)
            .addField('+utc', 'Gives you the UTC time in a 24-hour format.', true)
            .addField('+invite', 'Gives you a link to invite the bot, also an invite to the Dun-Dunv2 support server.', true)
            .addField('+uptime', 'Gives you the time that the bot has been online.', true)
            .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(helpEmbed);
    }

    // Invite Command.
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

    // Purge Command up to a 100. (Private)
    if(cmd == `${prefix}purge`) {
        // Checks User id so only my closest most lovely friends can do it.
        if (!message.author.id === '275701228422299648' || !message.author.id === '332956757800517640' || !message.author.id === '333305132739723275') {
            return message.channel.send('How do you know about this?!?!?!');
        }
        if (isNaN(args)) return message.channel.send('**Please supply a valid amount of messages to purge**');	
        if (args > 100) return message.channel.send('**Please supply a number less than 100**');	
        // Logging	
        console.log(`Purged ${args} messages. Purge done by: ${message.author.tag}`);	
        let argz = Number(args);	
        message.channel.bulkDelete(argz + 1)
            .then(messages => message.channel.send(`**Successfully deleted \`${messages.size - 1}/${args[0]}\` messages**`)	
            .then(message => message.delete(10000)));	
    }
    
    // Users Command (Private)
    if (cmd == `${prefix}users`) {
        console.log(`User checked by ${message.author.tag}`);
        if (!message.author.id === '275701228422299648' || !message.author.id === '332956757800517640' || !message.author.id === '333305132739723275') {
            return message.channel.send('How do you know about this?!?!?!');
        }
        let usersEmbed = new Discord.RichEmbed()
            .setTitle(`The bot currently has ${bot.users.size} users`)
            .setColor([54, 57, 62]);
        message.channel.send(usersEmbed);
    }

    // Guild Command (Private)
    if (cmd == `${prefix}guilds`) {
        console.log(`Guilds checked by ${message.author.tag}`)
        if (!message.author.id === '275701228422299648' || !message.author.id === '332956757800517640' || !message.author.id === '333305132739723275') {
            return message.channel.send('How do you know about this?!?!?!');
        }
        let guildEmbed = new Discord.RichEmbed()
            .setTitle(`The bot currently has ${bot.guilds.size} guilds`)
            .setColor([54, 57, 62]);
            message.channel.send(guildEmbed);
        }
        
    // UTC Command
    if (cmd == `${prefix}utc`) {
        console.log(`UTC given to ${message.author.tag}`);
        time = moment.utc();
        let timeform3 = time.format('DD/MM HH:mm');
        let utcEmbed = new Discord.RichEmbed()
            .setTitle('UTC Time')
            .setDescription(`${timeform3} UTC`)
            .setColor([101, 244, 66])
        message.channel.send(utcEmbed);
    }

        // ESTT command
        if (cmd == `${prefix}estt`) {
            console.log(`${message.author.tag} checked ESTT`);
            message.channel.startTyping(true);
            const ESTTURL = 'https://data.soderslattsfk.se/estt-weather/ww4.php';
            let ESTTResponse = await fetch(ESTTURL);
            let ESTTHTMLResponse = await ESTTResponse.text()
            const $ = cheerio.load(ESTTHTMLResponse);
            // message.channel.send(ESTTHTMLResponse);
            let ESTTImage = `https://data.soderslattsfk.se/estt-weather/${$('img')[0].attribs.src}`;
            let ESTTActiveRunway = $('h1')[0].children[0].data;
            let ESTTText = $.text().replace('\n', "");
            let esttEmbed = new Discord.RichEmbed()
                .setTitle(ESTTActiveRunway)
                .setAuthor('Söderslätts Flight Club', )
                .setImage(ESTTImage)
                .setDescription(ESTTText)
                .setColor([99, 154, 210]);
            message.channel.stopTyping(true);
            message.channel.send(esttEmbed);
        }
    });


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // All the work that is WIP...                                            
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // WIP Restart Command
    // if (cmd == `${prefix}restart`) {
    //     if (!message.author.id === '275701228422299648') return message.channel.send('**NO! HOW DARE YOU USE THIS COMMAND**');
    //     console.log('Restarting… Command given by ' + message.author.tag);
    //     let restartEmbed = new Discord.RichEmbed()
    //         .setTitle('Restarting...')
    //         .setColor([255, 0, 0]);
    //     await message.channel.send(restartEmbed).then(message => bot.destroy())
    //         .then(() => bot.login(dunDunToken)).then(message => { // Remember to change this Token here.
    //         let newRestartEmbed = new Discord.RichEmbed()
    //             .setTitle('Restart complete')
    //             .setColor([0, 255, 0]);
    //         bot.lastMessage.edit(newRestartEmbed)
    //     })
    // }

    // WIP weather / cloud questions.
    // if (cmd == `${prefix}clouds`) {
    //     console.log('Sending a picture of a cloud to ' + message.author.tag);
    //     message.channel.startTyping(true);
    //     const cbCloud = [
    //         'https://i.stack.imgur.com/O2s15.jpg',
    //         'https://i.imgur.com/n6TAESC.jpg',
    //         'https://i.imgur.com/pqolbGd.jpg',
    //         'https://i.imgur.com/KXkB7De.jpg',
    //         'https://i.imgur.com/zsN8Gip.jpg',
    //     ];
    //     let rand = Math.floor(Math.random * 2) + 1;
    //     if (rand === 1) {
    //         message.channel.send('Dab');
    //         message.channel.stopTyping(true);
    //     }
    //     else if (rand === 2) {
    //         // let randu = Math.floor(Math.random * cbCloud.length) + 1;
    //         console.log(randu);
    //         message.channel.sendFile(cdCloud[randu], 'cloud.jpg');
    //         message.channel.stopTyping(true);
    //     }
    // }

    // WIP cloud welp
    // if (cmd == `${prefix}cloudu`) {
    //     console.log('Cloudu welp.');
    //     message.channel.sendFile('https://i.imgur.com/JfpJdLl.jpg', 'Hot_Cloud_Welp.jpg');
    // }

    // // WIP dbl
    // if (cmd == `${prefix}dbl`) {
    //     console.log('Sending dbl');
    //     message.channel.send('https://discordbots.org/bot/436406106013827072');
    // }

    // // Comment out this! // Ty for the note.
    // if (cmd == `${prefix}leave`) {
    //     if (!message.author.id === '275701228422299648') return message.channel.send('No...');
    //     let leaveEmbed = new Discord.RichEmbed()
    //         .setTitle('Heck off then…') // Christian Server.
    //         .setDescription('[Here if you\'ll take me back…](https://discordapp.com/oauth2/authorize?client_id=416693730490318848&permissions=8&scope=bot)')
    //         .setColor([255, 0, 0]);
    //     message.channel.send(leaveEmbed).then(message => message.guild.leave());
    // }

    // // Because why not have it ready…
    // if (cmd == `${prefix}r/flying`) {
    //     message.channel.send('https://discordapp.com/invite/wwMP5RU');
    // }

    // WIP Servers Command (Shows what servers the bot is in)
    // if (cmd == `${prefix}servers`) {
    //     if (!message.author.id === '275701228422299648') return message.channel.send('Takes too much on the bot. (Ask Siaff#3293)');
    //     console.log(`${message.author.tag} looked at all the servers DunDun is in.`);
    //     message.channel.startTyping(true);
    //     bot.guilds.forEach(guild => {
    //         let string = '';
    //         string += '***Server Name:*** ' + guild.name + '\n' + '***Server ID:***` ' + guild.id + ' ` ' + '\n\n';
    //         message.channel.send(string);
    //     })
    //     message.channel.stopTyping(true);
    //     message.channel.send('Done!');
    // }

// Login key for Dun_Dunv2
bot.login(dunDunv2Token);