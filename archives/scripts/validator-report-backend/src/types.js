"use strict";
exports.__esModule = true;
exports.CacheEvent = exports.Bounty = exports.Channel = exports.Media = exports.MintStatistics = exports.SpendingProposals = exports.ProposalTypes = exports.Exchange = exports.WorkersInfo = exports.ValidatorReward = exports.Statistics = void 0;
var Statistics = /** @class */ (function () {
    function Statistics() {
        this.councilRound = 0;
        this.councilMembers = 0;
        this.electionApplicants = 0;
        this.electionAvgApplicants = 0;
        this.perElectionApplicants = 0;
        this.electionApplicantsStakes = 0;
        this.electionVotes = 0;
        this.avgVotePerApplicant = 0;
        this.dateStart = "";
        this.dateEnd = "";
        this.startBlock = 0;
        this.endBlock = 0;
        this.percNewBlocks = 0;
        this.startMembers = 0;
        this.endMembers = 0;
        this.newMembers = 0;
        this.percNewMembers = 0;
        this.newBlocks = 0;
        this.avgBlockProduction = 0;
        this.startThreads = 0;
        this.endThreads = 0;
        this.newThreads = 0;
        this.totalThreads = 0;
        this.percNewThreads = 0;
        this.startPosts = 0;
        // endPosts: number = 0;
        this.newPosts = 0;
        this.endPosts = 0;
        this.percNewPosts = 0;
        this.startCategories = 0;
        this.endCategories = 0;
        this.newCategories = 0;
        this.perNewCategories = 0;
        this.newProposals = 0;
        this.newApprovedProposals = 0;
        this.startChannels = 0;
        this.newChannels = 0;
        this.endChannels = 0;
        this.percNewChannels = 0;
        this.startMedia = 0;
        this.newMedia = 0;
        this.endMedia = 0;
        this.percNewMedia = 0;
        this.deletedMedia = 0;
        this.newMints = 0;
        this.startMinted = 0;
        this.totalMinted = 0;
        this.percMinted = 0;
        this.endMinted = 0;
        this.totalMintCapacityIncrease = 0;
        this.startCouncilMinted = 0;
        this.endCouncilMinted = 0;
        this.newCouncilMinted = 0;
        this.percNewCouncilMinted = 0;
        this.startCuratorMinted = 0;
        this.endCuratorMinted = 0;
        this.newCuratorMinted = 0;
        this.percCuratorMinted = 0;
        this.startStorageMinted = 0;
        this.endStorageMinted = 0;
        this.newStorageMinted = 0;
        this.percStorageMinted = 0;
        this.startIssuance = 0;
        this.endIssuance = 0;
        this.newIssuance = 0;
        this.percNewIssuance = 0;
        this.newTokensBurn = 0;
        this.newValidatorRewards = 0;
        this.avgValidators = 0;
        this.startValidators = "";
        this.endValidators = "";
        this.percValidators = 0;
        this.startValidatorsStake = 0;
        this.endValidatorsStake = 0;
        this.percNewValidatorsStake = 0;
        this.startStorageProviders = 0;
        this.endStorageProviders = 0;
        this.percNewStorageProviders = 0;
        this.newStorageProviderReward = 0;
        this.startStorageProvidersStake = 0;
        this.endStorageProvidersStake = 0;
        this.percNewStorageProviderStake = 0;
        this.newCouncilRewards = 0;
        this.startCurators = 0;
        this.endCurators = 0;
        this.percNewCurators = 0;
        this.newCuratorRewards = 0;
        this.startUsedSpace = 0;
        this.newUsedSpace = 0;
        this.endUsedSpace = 0;
        this.percNewUsedSpace = 0;
        this.avgNewSizePerContent = 0;
        this.totalAvgSizePerContent = 0;
        this.percAvgSizePerContent = 0;
        this.newStakes = 0;
        this.totalNewStakeValue = 0;
        this.newTextProposals = 0;
        this.newRuntimeUpgradeProposal = 0;
        this.newSetElectionParametersProposal = 0;
        this.spendingProposalsTotal = 0;
        this.bountiesTotalPaid = 0;
        this.newSetLeadProposal = 0;
        this.newSetContentWorkingGroupMintCapacityProposal = 0;
        this.newEvictStorageProviderProposal = 0;
        this.newSetValidatorCountProposal = 0;
        this.newSetStorageRoleParametersProposal = 0;
    }
    return Statistics;
}());
exports.Statistics = Statistics;
var ValidatorReward = /** @class */ (function () {
    function ValidatorReward() {
        this.sharedReward = 0;
        this.remainingReward = 0;
        this.validators = 0;
        this.slotStake = 0;
        this.blockNumber = 0;
    }
    return ValidatorReward;
}());
exports.ValidatorReward = ValidatorReward;
var WorkersInfo = /** @class */ (function () {
    function WorkersInfo() {
        this.rewards = 0;
        this.startStake = 0;
        this.endStake = 0;
        this.startNrOfWorkers = 0;
        this.endNrOfWorkers = 0;
    }
    return WorkersInfo;
}());
exports.WorkersInfo = WorkersInfo;
var Exchange = /** @class */ (function () {
    function Exchange() {
        this.sender = "";
        this.amount = 0;
        this.fees = 0;
        this.blockNumber = 0;
    }
    return Exchange;
}());
exports.Exchange = Exchange;
var ProposalTypes;
(function (ProposalTypes) {
    ProposalTypes["Text"] = "Text";
    ProposalTypes["RuntimeUpgrade"] = "RuntimeUpgrade";
    ProposalTypes["SetElectionParameters"] = "SetElectionParameters";
    ProposalTypes["Spending"] = "Spending";
    ProposalTypes["SetLead"] = "SetLead";
    ProposalTypes["SetContentWorkingGroupMintCapacity"] = "SetContentWorkingGroupMintCapacity";
    ProposalTypes["EvictStorageProvider"] = "EvictStorageProvider";
    ProposalTypes["SetValidatorCount"] = "SetValidatorCount";
    ProposalTypes["SetStorageRoleParameters"] = "SetStorageRoleParameters";
})(ProposalTypes = exports.ProposalTypes || (exports.ProposalTypes = {}));
var SpendingProposals = /** @class */ (function () {
    function SpendingProposals(id, spentAmount) {
        this.id = id;
        this.spentAmount = spentAmount;
    }
    return SpendingProposals;
}());
exports.SpendingProposals = SpendingProposals;
var MintStatistics = /** @class */ (function () {
    function MintStatistics(startMinted, endMinted, diffMinted, percMinted) {
        if (startMinted === void 0) { startMinted = 0; }
        if (endMinted === void 0) { endMinted = 0; }
        if (diffMinted === void 0) { diffMinted = 0; }
        if (percMinted === void 0) { percMinted = 0; }
        this.startMinted = startMinted;
        this.endMinted = endMinted;
        this.diffMinted = diffMinted;
        this.percMinted = percMinted;
    }
    return MintStatistics;
}());
exports.MintStatistics = MintStatistics;
var Media = /** @class */ (function () {
    function Media(id, title) {
        this.id = id;
        this.title = title;
    }
    return Media;
}());
exports.Media = Media;
var Channel = /** @class */ (function () {
    function Channel(id, title) {
        this.id = id;
        this.title = title;
    }
    return Channel;
}());
exports.Channel = Channel;
var Bounty = /** @class */ (function () {
    function Bounty(proposalId, title, status, amountAsked, amountMinted) {
        this.proposalId = proposalId;
        this.title = title;
        this.status = status;
        this.amountAsked = amountAsked;
        this.amountMinted = amountMinted;
    }
    return Bounty;
}());
exports.Bounty = Bounty;
var CacheEvent = /** @class */ (function () {
    function CacheEvent(section, method, data) {
        this.section = section;
        this.method = method;
        this.data = data;
    }
    return CacheEvent;
}());
exports.CacheEvent = CacheEvent;
