# WG Lead Term Limits

*This document was last updated for the [Rhodes Testnet](https://github.com/Joystream/joystream/issues/3296). It is based on [Sumer KPI 10.11](https://blog.joystream.org/sumer-kpis/#10.11).*

1. The council has to make sure  that for each group an `opening` for a new lead position exists at all times. This is to motivate non founding members to take on responsible positions in the DAO.
2. Every WG Lead is supposed to hire a Deputy Lead for training and support.
3. Each WG needs an Onboarding document that explains duties and how to perform all tasks to maintain ideal [group score](https://joystream.gitbook.io/testnet-workspace/testnet/council-period-scoring/general-working-group-score).

### For current Leads the soft term limit (starting from when this proposal is approved) is 1 month.

- To comply with [**Lead Opportunities**](https://joystream.gitbook.io/testnet-workspace/testnet/council-period-scoring#lead-opportunities) WG leads are preferably not FM. For FM in lead positions latest after one month the council is induced to start a transition of power to the Deputy Lead.
- The council advises the lead to promote and train a worker as **Deputy Lead** by creating a signal proposal that informs the council to involve the worker in meetings to support the Onboarding process. The council is free to involve other candidates in job interviews.
- The lead can define the time for the transition of power but latest after two weeks after the council terminates the FM lead and fills the lead opening.
- During this period the candidates are hired as lead on a test network to train using the [CLI](https://github.com/Joystream/joystream/tree/master/cli) and other tools to perform all necessary tasks.
- For Storage. Distribution and Builders this can include to prepare a fresh server in a shared session to set up a node and commonly needed tools.
- The goal is to guarantee a smooth transition of power and to reduce the time until a lead is fully capable to perform all duties.

When a lead is fired they can stay on as: 
- a guide (to help the newly hired lead on how to manage the position for a week). This will be paid at the previous rate + 50% for one week (via [`Funding Request`](#proposal-types))
- also as a worker if they apply for an opening. The new lead is encouraged to hire the old lead as a worker if there are enough places, since the old lead will have desirable skills to help with the group.

* In the event of a firing, the exact criteria for the transition period between the old and new lead will be discussed on the forum with the old lead and issued as a signal proposal for approval by the council
* In the event of a firing due to the soft term limit, it should not be considered that the lead was bad at the position, this is just a process to try and get a rotation of leads.

### Exceptions
* In the event the current lead is still in mid-process of implementing something important, they can create a text proposal with a description of what they're working on to allow for a one-time 2 week extension to their term before the `opening` proposal is created by the council.

### Proposal types

- `Create Working Group Lead Opening` - Same effect as when creating an opening for workers in the given group with given inputs, except the opening type is for lead.
- `Fill Working Group Lead Opening` - Same effect as when filling opening in group for worker with given inputs.
- `Update Working Group Budget` - Same effect as when filling opening in group for worker with given inputs.
- `Decrease Working Group Lead Stake` - Same effect as when decreasing worker stake in group with given inputs.
- `Slash Working Group Lead` - Same effect as slashing worker in the group, the staking account gets slashed.
- `Set Working Group Lead Reward` - Same effect as updating the reward of the worker.
- `Terminate Working Group Lead` - Same as when terminating a worker in group with given inputs, and removing lead designation.
- `Amend Constitution` - Proposal to amend constitution. Does not effect platform parameters.
- `Cancel Working Group Lead Opening` - Same as when cancelling an opening for workers in the given group with given inputs.
- `Funding Request` - Request to credit council budget and transfer tokens to specified accounts.
- `Signal` - Think of signal as the what, whereas rationale parameter in other proposals would be the why. Signal proposal does not effect any platform parameters when accepted.
