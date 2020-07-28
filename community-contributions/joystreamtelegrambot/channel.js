const { registerJoystreamTypes } = require('@joystream/types');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
const token = 'yourowntoken';
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token);
//get chat id here https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id
const chatid = 'yourownchat';

async function main () {
    registerJoystreamTypes()
    // Create the API and wait until ready
    const api = await ApiPromise.create({
        provider: new WsProvider() 
    })
    let lastchannelnotif = await getcurrentChannelId(api)
    //let lastchannelnotif = 25

    const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
        const currentchannelid = await getcurrentChannelId(api)
        console.log('Latest channelid is :',currentchannelid)

        if (currentchannelid>lastchannelnotif) {
            const newchannel = []
            for (lastchannelnotif+1;lastchannelnotif<currentchannelid;lastchannelnotif++) {
                const channel = await (await api.query.contentWorkingGroup.channelById(lastchannelnotif+1)).toJSON()
                const channeltitle = channel[0].title
                const memberid = channel[0].owner
                const channelownerhandler = await getmemberHandle(api, memberid)
                console.log(`Posting channel id: ${lastchannelnotif+1} to Telegram`)
                newchannel.push(`<b>New channel id created:</b>${lastchannelnotif+1}\r\n<b>Channel Title:</b><a href="https://testnet.joystream.org/#/media/channels/${lastchannelnotif+1}"> ${channeltitle}</a>\r\n<b>Member ID:</b> ${memberid}\r\n<b>Member Handler:</b> <a href="https://testnet.joystream.org/#/members/${channelownerhandler}">${channelownerhandler}</a>`)
            }
            bot.sendMessage(chatid, newchannel.join("\r\n\r\n"), { parse_mode: 'html' })
        }
    })
}

const getmemberHandle = async (api,memberid) => {
    const memberprofile = await api.query.members.memberProfile(memberid)
    const handler = memberprofile.raw.handle.toJSON()
    return handler
}

const getcurrentChannelId = async (api) => {
    const nextchannelid = await api.query.contentWorkingGroup.nextChannelId()
	const currentchannelid = nextchannelid.toNumber()-1
	return currentchannelid
}


main()