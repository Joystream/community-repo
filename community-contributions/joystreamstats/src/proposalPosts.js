const posts = [
  {
    threadId: 3,
    text: "Our first valid proposal, in this testnet. \\m/",
    id: 1,
  },
  {
    threadId: 6,
    text:
      "Tokens minted [here](https://testnet.joystream.org/#/explorer/query/0xe649437a8e4142f353d473936f5495e276de8f5d3f6886c8bf70c811812a66e8)\nand transferred over the next blocks.",
    id: 2,
  },
  {
    threadId: 7,
    text:
      "This has been cancelled as we can just repurpose the existing category for Joystream bounties for this purpose.",
    id: 3,
  },
  { threadId: 8, text: "Sounds good to me!", id: 4 },
  { threadId: 8, text: "Yup. Same here!", id: 5 },
  { threadId: 8, text: "Approved! :)", id: 6 },
  {
    threadId: 15,
    text:
      "I will give some percentage of the rewards to @tomato for creating the report template and @nexusfallout/Finnyfound for trying to help me :)",
    id: 7,
  },
  {
    threadId: 15,
    text: "😊 Thats okay. I was not able to do much work anyway.",
    id: 8,
  },
  { threadId: 15, text: "Hey, you deserve all the tokens! Great work!", id: 9 },
  {
    threadId: 17,
    text:
      "PS: Typo on Report Generator Report ->  Council Report Generator\n\nIf you want to find more information about the Council Report Generator you can check the PR here:\nhttps://github.com/Joystream/community-repo/pull/29",
    id: 10,
  },
  {
    threadId: 19,
    text:
      "Hi betilada, welcome to the community. This amount sounds fair to me and I'll be voting to approve! If the proposal is approved I look forward to seeing some of your videos!",
    id: 11,
  },
  {
    threadId: 19,
    text:
      "Hi @betilada, welcome!\n\n\nIs really great to see new content in Joystream so I will approve! \n\n\nThe amount you requested seems good to me.",
    id: 12,
  },
  {
    threadId: 21,
    text: "I suggested 40 slots but I can agree with 35 :)",
    id: 13,
  },
  {
    threadId: 21,
    text: "Sorry I just saw your post, we really need that Telegram bot back!",
    id: 14,
  },
  { threadId: 25, text: "Seems good! ", id: 15 },
  {
    threadId: 27,
    text: "I like the ideas, it should help to keep things organized!",
    id: 16,
  },
  {
    threadId: 29,
    text: "PS: Typo on Council Generator Report -> Council Report Generator",
    id: 17,
  },
  {
    threadId: 31,
    text:
      "For KPI 3.3-Appoint New Council Secretary,the payment is $50,As the price now,it's about 1.01M tjoy,isn't it?",
    id: 18,
  },
  {
    threadId: 30,
    text: "For KPI 2.2 Council report,the payment is $0,isn't it?",
    id: 19,
  },
  {
    threadId: 31,
    text:
      "Hi @anthony, the $50 is the rewards the council receives for completing the KPI, the KPI itself says `The Council informally appoints a Council Secretary through a spending proposal and pays them an appropriate rate for their responsibilities.` I put a similar amount for the past council sessions and we have passed this KPI.",
    id: 20,
  },
  {
    threadId: 30,
    text:
      "@anthony the council reports are mandatory, so there is no payment. It is a pass/fail for the council. When there is work for the council to do, there's nothing stopping people from creating spending proposals for completing the work. It's up to the council to vote on the proposals as they want to.\nThe KPI rewards are explained here: https://github.com/Joystream/helpdesk/blob/master/tokenomics/README.md#council-kpis",
    id: 21,
  },
  {
    threadId: 32,
    text:
      "From what I've seen in the test channel it looks like the bot does just about everything it used to. I can't judge the coding myself though.",
    id: 22,
  },
  {
    threadId: 35,
    text:
      "A small correction: For example, the storage lead has an `agreed payment of $35 per week`, but this is currently an `actual payment of $34 per week`",
    id: 23,
  },
  {
    threadId: 34,
    text:
      "This spot check includes this `at this time the Curator Lead has opted to not recieve payments (this was communicated on Telegram)` which is wrong. It is contradicted by the payment information which is correct.",
    id: 24,
  },
  { threadId: 34, text: "Great work!", id: 25 },
  {
    threadId: 35,
    text:
      "I approve this changes but we really should think about cutting the slots for the validators, since this should increase the reward of each validator, right?\nAs reported in Telegram it seems that validators are not getting enough tokens to compensate for the cost of the servers, which will increase in the future, with the chain size increasing.",
    id: 26,
  },
  {
    threadId: 35,
    text:
      "On top of this is a role which is a bit difficult to control the payments, since it depends in the amount in stake.",
    id: 27,
  },
  {
    threadId: 35,
    text:
      "@freakstatic I think this is because a lot of validators don't have a large amount of stake, so it is easy for a nominator to put backing behind the validator which reduces the validator's rewards a lot. You can see this on the targets page, where the ratio of `own stake` : `total stake` is as high as 1:10.",
    id: 28,
  },
  { threadId: 35, text: "Interesting I didn't know about that", id: 29 },
  { threadId: 33, text: "You are doing great job @tomato", id: 30 },
  {
    threadId: 36,
    text:
      "According to JS Team burning of tokens will not change the value of tokens.",
    id: 31,
  },
  {
    threadId: 36,
    text:
      "@nexusfallout it appears correct. If tokens are burned then it shouldn't affect the token value.",
    id: 32,
  },
  { threadId: 36, text: "Totally agreed ", id: 33 },
  {
    threadId: 45,
    text:
      "I'm resubmitting this because the last proposal failed due to low council mint capacity",
    id: 34,
  },
  {
    threadId: 47,
    text:
      "I forgot to include my github link, here it is: \nhttps://github.com/freakstatic",
    id: 35,
  },
  {
    threadId: 47,
    text: "Thank you for stepping up! The community appreciates it! :)",
    id: 36,
  },
  { threadId: 57, text: "This is a very clear report thanks @tomato.", id: 37 },
  {
    threadId: 58,
    text:
      "Hope it will be more heavy role once Atlas is live. Waiting for that.",
    id: 38,
  },
  {
    threadId: 60,
    text:
      'I forgot to note that "valid proposals" just means all proposals (including expired proposals) that were not cancelled or withdrawn.',
    id: 39,
  },
];

export default posts;
