const { registerJoystreamTypes } = require('@joystream/types');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const TelegramBot = require('node-telegram-bot-api');
// replace yourowntoken below with the Telegram token you receive from @BotFather
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

	//proposals
	let proposalcount = (await api.query.proposalsEngine.proposalCount()).toNumber()   
	let activeproposals =  await getactiveProposals(api)
	let filteredproposal
	let tobeexecutedprop = await getpendingProposals(api)
	let tobeexecutedpropfiltered

	//forum
	let lastpostnotif = await getcurrentPostId(api)
	let lastcatnotif = await getcurrentCatId(api)
	let lastthreadnotif = await getcurrentThreadId(api)

	//channel
	let lastchannelnotif = await getcurrentChannelId(api)

	//council
	var lastcouncilnotif = 0

	const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
		const block = header.number.toNumber()
		
		//proposals
		const currentproposal = (await api.query.proposalsEngine.proposalCount()).toNumber()
		console.log(`Current block: ${block}, Current proposal count: ${currentproposal}, Current active proposal : ${activeproposals}`)
		if (currentproposal>proposalcount) {
            for (proposalcount+1;proposalcount<currentproposal;proposalcount++) {
                const proposal = await getproposalDetail(api,proposalcount+1)
                const propcreatedtime = proposal.detail().createdAt.toJSON()

                console.log(`New proposal (${proposalcount+1}) created at block ${propcreatedtime}.\r\n ${proposal.postmessage()}`)
                bot.sendMessage(chatid, `New proposal (${proposalcount+1}) created at block ${propcreatedtime}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                activeproposals.push(proposalcount+1)
            }            
        }

        if (activeproposals[0]>0) {
            for (const proposallist of activeproposals){
                const proposal = await getproposalDetail(api,proposallist)
                let propstage = proposal.stage()[0]
                if (propstage == 'Finalized') {
                    const propstatus = proposal.resultjson()
                    switch (propstatus[0]){
                        case 'Approved':
                            let graceperiod = proposal.graceperiod()
                            if (graceperiod>0) {
                                bot.sendMessage(chatid, `Proposalid (${proposallist}) status changed to "Finalized" at block ${proposal.finalizedtime()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                                filteredproposal = activeproposals.filter(e => e != proposallist)
                                tobeexecutedprop.push(proposallist)
                            } else {
                                bot.sendMessage(chatid, `Proposalid (${proposallist}) status changed to "Finalized and Executed" at block ${proposal.finalizedtime()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                                filteredproposal = activeproposals.filter(e => e != proposallist)
                            }
                            break;
                        case 'Expired':
                        case 'Canceled':
                        case 'Cancelled':
                        case 'Rejected':
                        case 'Slashed':
                        case 'Vetoed':
                            // console.log(`Proposal ${proposallist} ${propstatus[0]}`)
                            // bot.sendMessage(chatid, `Proposalid (${proposallist}) status changed to <b>"Finalized:${propstatus[0]}"</b> at block ${proposal.finalizedtime()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                            // filteredproposal = activeproposals.filter(e => e != proposallist)
                            // break;
                        default:
                            console.log(`Proposal ${proposallist} changed to other status: ${propstatus[0]}`)
                            bot.sendMessage(chatid, `Proposalid (${proposallist}) status changed to <b>"Finalized:${propstatus[0]}"</b> at block ${proposal.finalizedtime()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                            filteredproposal = activeproposals.filter(e => e != proposallist)
                            break;
                    }
                    activeproposals = filteredproposal
                }
            } 
        }
        if (tobeexecutedprop[0]>0) {
            for (const proposallist of tobeexecutedprop) {
                const proposal = await getproposalDetail(api,proposallist)
                let exestatus = Object.getOwnPropertyNames(proposal.resultfull()['Approved'])[0]
                if (exestatus=='Executed'){
                    console.log(`Proposal ${proposallist} has been executed`)
                    bot.sendMessage(chatid, `Proposalid (${proposallist}) <b>has been executed</b> at block ${proposal.finalizedtime()+proposal.graceperiod()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                    tobeexecutedpropfiltered = tobeexecutedprop.filter(e => e != proposallist)
                } else {
                    console.log(`Proposal ${proposallist} Execution is failed`)
                    bot.sendMessage(chatid, `Proposalid (${proposallist}) <b>failed to be executed</b> at block ${proposal.finalizedtime()+proposal.graceperiod()}.\r\n ${proposal.postmessage()}`, { parse_mode: 'html' })
                    tobeexecutedpropfiltered = tobeexecutedprop.filter(e => e != proposallist)
                }    
                tobeexecutedprop = tobeexecutedpropfiltered
            }
		}
		//forum
		const currentpost = await getcurrentPostId(api)
		const currentcat = await getcurrentCatId(api)
		const currentthread = await getcurrentThreadId(api)
	
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


		//channel
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
		
		//council

		if (block>lastcouncilnotif) {
            const councilround = await api.query.councilElection.round()
            const councilendterm = (await api.query.council.termEndsAt()).toNumber()
            const annperiod = (await api.query.councilElection.announcingPeriod()).toNumber()
            const votingperiod = (await api.query.councilElection.votingPeriod()).toNumber()
            const revealingperiod = (await api.query.councilElection.revealingPeriod()).toNumber()
            const councilstage = await getcouncilStage(api)
            const councilperiod = (await api.query.councilElection.newTermDuration()).toNumber() 
            switch (councilstage){
                case null:
                    console.log('Council has been elected')
                    if (block>lastcouncilnotif){
                        bot.sendMessage(chatid, `<a href="https://testnet.joystream.org/#/council/members"> New council for round ${councilround}</a> has been elected at block ${councilendterm-councilperiod}.`, { parse_mode: 'html' })
                        lastcouncilnotif=councilendterm
                    }
                    break;

                default:
                    const annstage = councilstage.Announcing
                    const votingstage = councilstage.Voting
                    const revealingstage = councilstage.Revealing
                    if (annstage) {
                        console.log('Announcing Stage')
                        if (block>lastcouncilnotif){
                            bot.sendMessage(chatid, `New council election for round ${councilround} has been started at block ${annstage-annperiod}.<a href="https://testnet.joystream.org/#/council/applicants"> You can apply now!</a>`, { parse_mode: 'html' })
                            lastcouncilnotif=annstage
                        }
                    }
                    if (votingstage) {
                        console.log('Voting Stage')
                        if (block>lastcouncilnotif){
                            bot.sendMessage(chatid, `Voting stage for council election has been started at block ${votingstage-votingperiod}. <a href="https://testnet.joystream.org/#/council/applicants">You can vote now!</a>`, { parse_mode: 'html' })
                            lastcouncilnotif=votingstage
                        }
                    }
                    if (revealingstage) {
                        console.log('Revealing Stage')
                        if (block>lastcouncilnotif){
                            bot.sendMessage(chatid, `Revealing stage for council election has been started at block ${revealingstage-revealingperiod}. <a href="https://testnet.joystream.org/#/council/votes">Don't forget to reveal your vote!</a>`, { parse_mode: 'html' })
                            lastcouncilnotif=revealingstage
                        }
                    }       

                    break;
            }
        }
		


	})
}

//functions

//proposals
const getpendingProposals = async (api) => {
    let tobeexecutedprop = ((await api.query.proposalsEngine.pendingExecutionProposalIds()).toJSON())[0]
    if (tobeexecutedprop[0]==0){
        return []
    } else {
        return tobeexecutedprop
    }
}

const getactiveProposals = async (api) => {
    let activeproposals =  ((await api.query.proposalsEngine.activeProposalIds()).toJSON())[0]
    if (activeproposals[0]==0){
        return []
    } else {
        return activeproposals
    }
}

const getmemberHandle = async (api,memberid) => {
    const memberprofile = await api.query.members.memberProfile(memberid)
    const handler = memberprofile.raw.handle.toJSON()
    return handler
}

const getproposalStatus = (propresultraw) => {
    if (propresultraw.hasOwnProperty('proposalStatus')) {
        return propresultraw.proposalStatus
    } else {
        return {Active:null}
    }
} 

const getfinalTime = (propresultraw) => {
    if (propresultraw.hasOwnProperty('finalizedAt')) {
        return propresultraw.finalizedAt
    } else {
        return 0
    }
}

const getproposalDetail = async (api,proposalcount) => {
    const propdetail = await api.query.proposalsEngine.proposals(proposalcount)
    const parameters = propdetail.parameters
    const propposterid = propdetail.proposerId.toJSON()
    const handler = await getmemberHandle(api,propposterid)
    const proptype = await api.query.proposalsCodex.proposalDetailsByProposalId(proposalcount)
    const [deftype] = Object.getOwnPropertyNames(proptype.toJSON())
    const proptitle = propdetail.get("title")
    const propstage = propdetail.status.toJSON()
    // const propstatus = propdetail.get("status")
    const propstatus = Object.getOwnPropertyNames(propstage)
    const propresultraw =  propstage[propstatus]
    const propfinalresultfull = getproposalStatus(propresultraw)
    // const propfinalresultfull = propresultraw.proposalStatus
    // const propfinalresultjson = Object.getOwnPropertyNames(propresultraw.proposalStatus)
    const propfinaltime = getfinalTime(propresultraw)
    // const propfinaltime = propresultraw.finalizedAt
    const propfinalresultjson = Object.getOwnPropertyNames(propfinalresultfull)
    const graceperiod = propdetail.parameters.gracePeriod.toNumber()
    return {
        detail : function () {
            return propdetail;
        },
        parameters : function () {
            return parameters;
        },
        stage : function () {
            return propstatus;
        },
        finalizedtime : function () {
            return propfinaltime;
        },
        graceperiod : function () {
            return graceperiod;
        },
        resultfull : function () {
            return propfinalresultfull;
        },
        resultjson : function () {
            return propfinalresultjson;
        },
        postmessage : function () {
            return `<b>Type</b>: ${deftype}\r\n <b>Proposer</b>:<a href="https://testnet.joystream.org/#/members/${handler}"> ${handler}(${propposterid})</a>\r\n <b>Title</b>: <a href="https://testnet.joystream.org/#/proposals/${proposalcount}">${proptitle}</a>\r\n <b>Stage</b>: ${propstatus}\r\n <b>Result</b>: ${JSON.stringify(propfinalresultfull)}`;
        // postmessage : function () {
        //     return `<b>Type</b>: ${this.deftype()}\r\n <b>Proposer</b>: ${this.handler()}(${this.posterid()})\r\n <b>Title</b>: ${this.title()}\r\n <b>Stage</b>: ${this.stage()}\r\n <b>Result</b>: ${this.result()}`;
        }
    }
}
//forum
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



//channel

const getcurrentChannelId = async (api) => {
    const nextchannelid = await api.query.contentWorkingGroup.nextChannelId()
	const currentchannelid = nextchannelid.toNumber()-1
	return currentchannelid
}

//council
const getcouncilStage = async (api) => {
    const councilstage = await api.query.councilElection.stage()
	const councilstagejson = councilstage.toJSON()
	return councilstagejson
}


main()
