const { registerJoystreamTypes } = require('@joystream/types');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const TelegramBot = require('node-telegram-bot-api');
// replace yourowntoken below with the Telegram token you receive from @BotFather
const token = 'yourowntoken';
const bot = new TelegramBot(token);
//replace yourownchat, get chat id here https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id
const chatid = 'yourownchat';

async function main () {
    registerJoystreamTypes()
    // Create the API and wait until ready
    const api = await ApiPromise.create({
        provider: new WsProvider() 
    })
    
    let proposalcount = (await api.query.proposalsEngine.proposalCount()).toNumber()   
    // let activeproposals = []
    // let activeproposals =  ((await api.query.proposalsEngine.activeProposalIds()).toJSON())[0]
    
    let activeproposals =  await getactiveProposals(api)
    let filteredproposal
    let tobeexecutedprop = await getpendingProposals(api)
    let tobeexecutedpropfiltered
    

    const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
        const block = header.number.toNumber()
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
    })
}

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
    const proptitle = propdetail.title.toJSON()
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
            return `<b>Type</b>: ${deftype}\r\n <b>Proposer</b>:<a href="https://testnet.joystream.org/#/members/${handler}"> ${handler}(${propposterid})</a>\r\n <b>Title</b>: <a href="https://testnet.joystream.org/#/proposals/${proposalcount}">${proptitle.substring(0,100)}</a>\r\n <b>Stage</b>: ${propstatus}\r\n <b>Result</b>: ${JSON.stringify(propfinalresultfull)}`;
        // postmessage : function () {
        //     return `<b>Type</b>: ${this.deftype()}\r\n <b>Proposer</b>: ${this.handler()}(${this.posterid()})\r\n <b>Title</b>: ${this.title()}\r\n <b>Stage</b>: ${this.stage()}\r\n <b>Result</b>: ${this.result()}`;
        }
    }
}

main()
