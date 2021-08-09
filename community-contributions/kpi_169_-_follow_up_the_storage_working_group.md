### KPI 16.9 - Follow up the Storage Working Group

Scope of work 1.

Recurring Rewards:
* The recurring rewards should cover the cost of the server and a minor amount for bootstrapping, upgrading and maintaining. This ensures the storage providers are never out of pocket at minimum pay.
	* It may be time to do another review of costs, since the storage directory is about 700 GB now.
* The Lead's payments should also cover the minimum needed (as they also have to run a storage provider) as well as some extra so they are at least paid a minimum for management even if the KPIs are not met.

KPIs:
* In the early stages the KPIs should either be written by Jsgenesis, or the council or a combination of both.
	* If longer council terms are approved, then the council should be responsible for grading the KPIs and presenting said grading to Jsgenesis so that the workload is distributed. For this purpose a thread should be created and the Storage WG should submit their own summary including relevant data and links. If they fail to report, they should recieve no rewards.
	* This format is suggested as it can basically replace `spot checks` which are very rarely done any more. This would maybe help to build a better relationship between a WG's performance + reporting and the council scoring it. It would also provide better incentives to the WGs. Currently the council's monitoring of WG performance is quite limited and far too sporadic.
		* The grading should be strict, and if certain things are not done it should be highlighted. It should also include a check through the relevant Discord/Forum areas and some notes about issues, responsiveness to messages and overall health of the WG.
		* If the council fails to do grading on time, then they should recieve no rewards for the specific KPI and nor should the WG (or at least limited rewards). This will hopefully ensure that the council has people on it that are paying attention, thereby incentivizing voting for proper candidates.
		* JSG can briefly check the grading and if it is acceptable, do payouts. If the grading is incorrect, they can deduct the amount, or a percentage of the amount from the overall KPI rewards in that council term.
		* The deadline would have to be staggered so it is before the end of the term and allow enough time for a CM to check and grade the summaries from the WG.
	* Using this format the Council can still obtain some amount of rewards for management, checking, grading and reporting and also be more directly responsible for monitoring the WG.
	* It would be hoped that for KPIs that require a lot of work from the WG itself, there would be a split in the rewards between the council + a one-time payment to the Lead and/or workers.
	* This would avoid `backroom deals` which would probably lead to an opaque process between individual CMs and the WG.
	* If the council fails to grade the Storage WG, there could be an annihiliation implemented for all relevant rewards (i.e. if the total potential rewards for managing the Storage WG are $250 and only $50 of this is for grading, and the grading is not done, then the council would forfeit all $250 in rewards)


* The Storage Lead should recieve some form of KPI rewards for doing reporting on time, at this present point in time there is no direct financial incentive for doing reporting. Using a system like this might allow us to introduce a higher standard of reporting for the WG.

OKRs:
* It is recommended that the measurement of OKRs for the Storage WGs is assigned as a task to the `Operations` group. This seems like the most beneficial route as it will start to build a better relationship between assigning essential tasks to `operations` and following up on them consistently.
	* The data gathered should then be used by a Council Member to prepare an OKR report.
	* Assigning the gathering of data (not reporting) to the `operations` group will allow that group to develop more regular tasks to complete. It will also lead to The Council/JSG to be able to create OKRs for `operations` that ensure these tools are working on a consistent basis with minimal downtime.
* It is recommended that as a starting point `25-35%` above the `base rewards` is used for OKRs. Ideally these would come from the KPI reward pool, but could also come from the council's mint.
* With regards to the stick + carrot approach, the council should start a discussion and create a document outlining a system for punishing the Working Group for failing to meet several OKRs. They should discuss the multiple options available (warnings, slashing stake of lead, firing, cutting rewards). Some balance in this aspect is needed so it is insufficient for a single person to suggest a system.
	* OKRs could have two separate methods of grading.
		* One could be a baseline exepectation of how the group should be performing
			* If this is not matched then it may be the time to look at punishment. This might be something like a requirement of minimum uptime, latency and storage capacity for the platform to run at a basic level.
		* The other could be a "goal" that provides rewards for the group.
			* These can be goals to increase the performance of the group. The rewards could be paid via KPIs or minted tokens.
* Tools needed
	* A way of randomly testing storage providers for a set of random videos to check the storage provider speed (download). It is believed that the `operations` group already have a tool which does this to some extent: https://joystreamstats.live/storage It would be preferable if this tool is adapted so that it can do an output of download speed to a log file--this would allow the council to far more easily go through data rather than having to manually check every day.
	* Based on research there is a tool called `puppeteer` that can accomplish this. Due to the high learning curve of this tool, it seems it would be appropriate to assign the initial set up of this tool to the `operations group`.