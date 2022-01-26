// https://github.com/Joystream/joystream/blob/giza/node/src/chain_spec/mod.rs#L302-L350

export const workingGroups = {

    'storageWorkingGroup': '935830891496874004', 
    'contentWorkingGroup': '935831035999055942',
    'operationsWorkingGroupAlpha': '935831093318402048',
    'gatewayWorkingGroup': '935831248461520896',
    'distributionWorkingGroup': '935831289800585257',
    'operationsWorkingGroupBeta': '935831160343388170',
    'operationsWorkingGroupGamma': '935831206409437194'
}


export const wgEvents = [
    'AcceptedApplications', 
    'ApplicationTerminated',
    'ApplicationWithdrawn',
    'AppliedOnOpening',
    'BeganApplicationReview',
    'LeaderSet',
    'LeaderUnset',
    'MintCapacityChanged',
    'OpeningAdded',
    'OpeningFilled',
    'StakeDecreased', 
    'StakeIncreased', 
    'StakeSlashed', 
    'TerminatedLeader', 
    'TerminatedWorker', 
    'WorkerExited', 
    'WorkerRewardAccountUpdated',
    'WorkerRewardAmountUpdated', 
    'WorkerRoleAccountUpdated', 
    'WorkerStorageUpdated'
]