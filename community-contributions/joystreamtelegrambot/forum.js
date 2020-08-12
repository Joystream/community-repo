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
  // register types before creating the api
  registerJoystreamTypes()
  // Create the API and wait until ready
  const api = await ApiPromise.create({
    provider: new WsProvider() 
    })

    //set (initial) lastpostnotification sent by bot, 
	let lastpostnotif = await getcurrentPostId(api)
	let lastcatnotif = await getcurrentCatId(api)
	let lastthreadnotif = await getcurrentThreadId(api)

    //subscribing to new heads of the chain
    const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
		const currentpost = await getcurrentPostId(api)
		const currentcat = await getcurrentCatId(api)
		const currentthread = await getcurrentThreadId(api)
	
    	const block = header.number.toNumber()
		console.log(`Current block: ${block}, Latest postid: ${currentpost}, Latest categoryid: ${currentcat}, Latest threadid:${currentthread}`)
		
		//category forum checking
		if (currentcat>lastcatnotif){
			for (lastcatnotif+1; lastcatnotif<currentcat; lastcatnotif++){
				const categorytitle = await getcategoryTitle(api,lastcatnotif+1)
				console.log('Notify category',lastcatnotif+1, 'to Telegram')
				bot.sendMessage(chatid, `New category created: <b><a href="https://testnet.joystream.org/#/forum/categories/${lastcatnotif+1}">${categorytitle}</a>, Category ID: ${lastcatnotif+1}</b>`, { parse_mode: 'html' })
			}

		}
		
		//thread forum checking
		if (currentthread>lastthreadnotif){
			const newthread = []
			for (lastthreadnotif+1; lastthreadnotif<currentthread; lastthreadnotif++){
				const threadid = await api.query.forum.threadById(lastthreadnotif+1)
				const threadtitle = threadid.title
				const currentcategory = threadid.category_id
				const categorytitle = await getcategoryTitle(api,currentcategory)
				const authoraddress = threadid.author_id.toJSON()
				const memberraw = await api.query.members.memberIdsByRootAccountId(authoraddress)
				const memberid = memberraw[0].toNumber()
				const handler = await getmemberHandle(api, memberid)
				console.log('Notify thread',lastthreadnotif+1, 'to Telegram')
				//sent to array			
				newthread.push(`New thread created: <a href="https://testnet.joystream.org/#/forum/threads/${lastthreadnotif+1}">"${threadtitle}"</a> by <a href="https://testnet.joystream.org/#/members/${handler}">${handler}</a> (id:${memberid}) in category "<a href="https://testnet.joystream.org/#/forum/categories/${currentcategory}">${categorytitle}</a>" `)
			}
		bot.sendMessage(chatid, newthread.join("\r\n\r\n"), { parse_mode: 'html' })
		}
			
		//forum post checking
    	if (currentpost>lastpostnotif) {
			console.log(currentpost-lastpostnotif, ' new posts')
			const newpost = []
			//loop notification for every new post published since lastnotif
			for (lastpostnotif+1; lastpostnotif<currentpost; lastpostnotif++) {
				//begin chaining query info
				const postbyid = await api.query.forum.postById(lastpostnotif+1)
				const postpos = postbyid.nr_in_thread
				const message = postbyid.current_text
				//limit characters for message on telegram
				const excerpt = message.substring(0,100)
				const currentthreadid = postbyid.thread_id.toNumber()
				const threadid = await api.query.forum.threadById(currentthreadid)
				const threadtitle = threadid.title
				const currentcategory = threadid.category_id
				const categorytitle = await getcategoryTitle(api,currentcategory)
				const authoraddress = postbyid.author_id.toJSON()
				const memberraw = await api.query.members.memberIdsByRootAccountId(authoraddress)
				const memberid = memberraw[0].toNumber()
				const handler = await getmemberHandle(api, memberid)
				console.log('Notify post',lastpostnotif+1, 'to Telegram')
				//sent to array			
				newpost.push(`🤩<b> New post (id:${lastpostnotif+1}) by <a href="https://testnet.joystream.org/#/members/${handler}">${handler}</a> (id:${memberid}) in category "<a href="https://testnet.joystream.org/#/forum/categories/${currentcategory}">${categorytitle}</a>" at:\r\n<a href="https://testnet.joystream.org/#/forum/threads/${currentthreadid}?replyIdx=${postpos}">"${threadtitle}"</a></b><i>\r\n"${excerpt}..."</i>\r\n`)
			}
		//console.log(newpost.join("\r\n\r\n"))
		bot.sendMessage(chatid, newpost.join("\r\n\r\n"), { parse_mode: 'html' })
		//update lastnotif
		// lastpostnotif=currentpost
		}
		  
	});
}

const getcategoryTitle = async (api, categoryid) => {
    const category = await api.query.forum.categoryById(categoryid)
	const categorytitle = category.title
	return categorytitle
}

const getcurrentPostId = async (api) => {
    const nextpostid = await api.query.forum.nextPostId()
	const currentpostid = nextpostid.toNumber()-1
	return currentpostid
}

const getcurrentThreadId = async (api) => {
    const nextthreadid = await api.query.forum.nextThreadId()
	const currentthreadid = nextthreadid.toNumber()-1
	return currentthreadid
}

const getcurrentCatId = async (api) => {
    const nextcatid = await api.query.forum.nextCategoryId()
	const currentcatid = nextcatid.toNumber()-1
	return currentcatid
}

const getmemberHandle = async (api,memberid) => {
    const memberprofile = await api.query.members.memberProfile(memberid)
    const handler = memberprofile.raw.handle.toJSON()
    return handler
}

main()