# [47.DT-1 - Olympia - Handover](https://blog.joystream.org/sumer-kpis/#47.DT-1)

There is still a lot room for improvement for the a lead + deputy team.

1. Outline the current routines and workflow of the Storage group: Routines for noticing, and the following actions, when/if: a node goes down, a distributor provides poor service, etc.

None of these are automated yet. There is a script that reports performance stats to jsstats which is displayed on https://joystreamstats.live/distribution but it has to be run by someone (only results older less than a day are displayed): https://github.com/Joystream/community-repo/pull/679 (Open task: [Content benchmark](https://github.com/Joystream/community-repo/issues/656))

2. Outline the current setup, and explain why it is the way it is.

- number of nodes and (family) buckets: Our beautiful planet has 7 [continents](https://en.wikipedia.org/wiki/Continent), we got 9 distribution bucket families. There can be more when more fine grained distribution is needed.
- geographical distribution: every continent has at least 1 family and bucket for basic global distribution. Central / Northern Europe (1) and Eastern Europe / Western Asia (2) have a some more buckets that could be optimized to save costs.
- dynamic bag policy: Currently buckets with big enough cache are assigned to new buckets. This is simple and practical for now and should be replaced by some more sophisticated scheme on the new scheme to prepare for bigger upload waves.
- mode settings: All buckets are accepting and distributing, all disfunctional buckets / operators have been removed which [revealed a bug](https://discord.com/channels/811216481340751934/859752198166282280/954662917045903382).
- hardware requirements: Recommend are at least 2 cores, 2GB RAM and minimal 100 GB disk space (using external QN), better 200 GB upwards to also host a local validator node and extend the cache limit.
- there are lots more thoughts in the [first report](https://github.com/Joystream/community-repo/blob/master/working-groups/distributors/giza1.md) that should be thought over and amended by smart OKR.

3. Outline the extra work you, the Lead, do that may not be obvious.

- Organizing: I use an [emacs org-mode table](https://orgmode.org/org.html#Advanced-features) with some formulas to calculate rewards. I can share if there is interest but i doubt anyone would do the same. Also keeping a permanent bash session in tmux to fast find previously used commands with ctrl+r or `history`, also in the mentioned text file.

- Hiring: This involves a lot of simple steps that are all explained [here](https://github.com/Joystream/helpdesk/tree/master/roles/distributors-lead). Some possible improvements are shared in the [wishlist](https://github.com/Joystream/joystream/issues/276).

- Managing the Workers (at the "human" level): This is the actual fun part of the job because every worker is different and brings their level of versality. Some need no input and some ask every step on the way even when the manual is publicly known. I appreciate both ways because communication can be fun when there is nothing else pressing. I recommend doing max in private messages to burden everyone else and just pin selected compacted instructions / experiences with everyone.

- Adjusting rewards: This was definitively the most challenging part because there was no input by anyone about intended budget. Rules like the $80 setup bonus were needed for some and had to be granted to all just to be fair. After filling all families and gaining some experience with prices i would probably be more strict about allowed price ranges when hiring. Also better not to hire before the worker set up a node although this would leave the risk (setup fee, work) on them. Every lead has to find their way.

> Is there anything you've learned along the way, that wasn't at all clear (or even wrong) from the guides?

Patience is always is plus, also openness for both sides. I trust my workers to share their costs honestly and always try to pay above that even if it means to overpay in some cases. Surely the system will need to get more fine-grained (thinking of the price per GB, it was just luck that the formula `GB * eras * 10` yielded useful tJOY rewards at current token value, which is about to end with further inflation). Also measuring and recording performance to automatically adjust rewards. A fresh lead will probably bring a bit more enthusiasm than me after 6 months and currently two lead roles + council work.

> If there is anything else you'd wish someone told you when you became the Lead - explain!

I wish someone would have showed interest to assist as Deputy Lead but i guess it is a sign of trust that i will just do the right thing. One more reason to make space for fresh blood. Maybe i will take the time to write something more helpful later. :)
