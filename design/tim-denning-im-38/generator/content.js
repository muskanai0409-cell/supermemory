// `head` and `body` strings are Tim Denning's wording (purple ink on the map). […] marks our trims;
// a plain … inside a quote is his. `note`, `card` and any `para` lesson are ours (black ink).
// Controls 1–3 follow the article's published order; the rest are grouped by subject.

const THEMES = {
  path:   { name: 'Path',   long: 'Path & risk' },
  mind:   { name: 'Mind',   long: 'Mind & standards' },
  work:   { name: 'Work',   long: 'Work & business' },
  money:  { name: 'Money',  long: 'Money' },
  body:   { name: 'Body',   long: 'Body' },
  people: { name: 'People', long: 'People' },
};

const LESSONS = [
  { theme: 'path', card: 'Take risks. By 35 it shows.', link: '#route',
    head: 'When you turn 35 you’ll see the difference between those who took risks and those who didn’t.' },
  { theme: 'people', card: 'Kids are where freedom begins.',
    head: 'Having kids isn’t the end of freedom, it’s the beginning. It’ll give you meaning that’ll fuel your greatness.' },
  { theme: 'mind', card: 'Obsession makes high performers.',
    head: 'Chasing obsession is the fastest way to become a high performer.' },

  { group: 'path', theme: 'path', card: 'Skip the conventional path.', featured: 'Never follow the conventional path.',
    head: 'Never follow the conventional path. It’s full of boredom and has the most competition.',
    note: 'He sums up that path as a degree, debt, a job you pretend is your life’s work, and marrying the first person who shows interest.' },
  { theme: 'path', card: 'Burn your parents’ plan. Make yours.',
    head: 'Take your parent’s plan for your life & light it on fire. The best path is one you create.' },
  { theme: 'path', card: 'Hard things make you successful.',
    head: 'The more hard things you do the more successful you become.',
    body: 'These challenges forced me to develop mental muscle and acquire skills most didn’t have.',
    note: 'He means his childhood. He grew up in a rough area, and his family lost both their homes to bankruptcy.' },

  { group: 'mind', theme: 'mind', card: 'Standards so high people think you’re unhinged.', featured: 'Raise your standards so high people think you’re a psychopath.',
    head: 'Raise your standards so high people think you’re a psychopath. Screw being average.',
    body: 'When you raise your standards life gets easier. A lot of decisions are automated for you. […] As long as you stick to your higher than normal standards the rewards that come with them are a given … and they’re huge. More money, time, freedom, energy, happiness, and fulfillment.' },
  { theme: 'mind', card: 'Hear disagreement without reacting.',
    head: 'One of the clearest signs of intelligence is being able to hear an opinion you disagree with and not act emotionally.',
    body: 'The people you disagree with can teach you the most.' },
  { theme: 'mind', card: 'Turn off news and politics.',
    head: 'Turn off news and politics to naturally increase your IQ.' },
  { theme: 'mind', card: 'Visit a retirement home for motivation.',
    head: 'Go visit a retirement home so you know what dying feels like. Then use it as motivation.' },

  { group: 'work', theme: 'work', card: 'Get off the corporate ladder.',
    head: 'No one who climbs the corporate ladder is happy. It’s a trap. Choose freedom.',
    body: 'If you want to be happier then get the hell off the corporate ladder. Stop worrying about promotions, pay rises, and job titles and go build something online that gives you actual freedom.',
    note: 'He cites his friend Dickie Bush, who left BlackRock after meeting the people 10 and 20 years ahead of him and finding none of them happy.' },
  { theme: 'work', card: 'Layoffs prove companies don’t care.',
    head: 'Corporations pretend to care about people to protect their corporate image and lure more victims, but layoff culture shows they don’t care at all. One minute “thoughts and prayers.” Next minute “you’ve been let go.”' },
  { theme: 'work', card: 'Learn skills people need.',
    head: 'Society is full of people who need things. Either you will go about the task of seeing to those needs by learning a unique set of skills, or the world will reject you, no matter how inoffensive and courteous you are.',
    note: 'The line echoes David Wong’s 2012 Cracked essay “6 Harsh Truths That Will Make You a Better Person.”' },
  { theme: 'work', card: 'Learn psychology. Business follows.', featured: 'Business is just a psychology masterclass.',
    head: 'Understand human psychology and you can make as much money as you want. Business is just a psychology masterclass. Life is too.',
    body: 'Most people who fail just don’t understand human nature.' },
  { theme: 'work', card: 'Write online. Stop asking permission.',
    head: 'Writing online is the easiest way to attract more opportunities so you can stop asking for permission.' },
  { theme: 'work', card: 'Build online under a nickname.',
    head: 'Disappear from public life. Adopt a nickname. Then build something online with zero fear.' },
  { theme: 'work', card: 'Flow beats productivity.', para: true,
    head: 'He ranks flow states above productivity.',
    note: 'Our wording. We could not confirm his exact sentence.' },

  { group: 'money', theme: 'money', card: 'Learn how money works.', featured: 'If you don’t learn how money works you will always work for money.',
    head: 'If you don’t learn how money works you will always work for money.' },
  { theme: 'money', card: 'Money is a resource for freedom.',
    head: 'Money isn’t evil. It’s a resource that’ll help you reach personal freedom.' },
  { theme: 'money', card: 'Read finance books. Invest early.',
    head: 'Read every popular finance book and invest money early on.' },
  { theme: 'money', cardHtml: 'Read <i>The Bitcoin Standard</i>. Buy Bitcoin.', card: 'Read The Bitcoin Standard. Buy Bitcoin.',
    head: 'Read “The Bitcoin Standard.” Then buy Bitcoin before major governments like the U.S. do.' },
  { theme: 'money', card: 'City while young. Suburbs later.',
    head: 'Live in the city while you’re young to network. Then as you get older move to the outer suburbs to save money and reduce debt.' },

  { group: 'body', theme: 'body', card: 'Keep dopamine on a leash.',
    head: 'Keeping your dopamine addiction under control will help you more than any other health hack.',
    body: 'How you invest your dopamine will either uplift you or leave you feeling bored and unmotivated.' },
  { theme: 'body', card: 'Games become a time suck with age.',
    head: 'Video games are fine when you’re younger. But when you’re older they become a time suck.' },
  { theme: 'body', card: 'Exercise daily, outdoors.',
    head: 'Exercise every day, preferably in nature. It’ll keep you younger for longer.',
    note: 'Orienteering, the sport this map copies, counts.' },
  { theme: 'body', card: 'Give up alcohol.',
    head: 'Give up alcohol. It’s a scam that’ll steal your energy & help you sleep with strangers & get STDs.' },

  { group: 'people', theme: 'people', card: 'Outgrow friends, gently.',
    head: 'As you get older you’ll want to leave your loser friends behind. It’s normal.',
    body: 'Later in life you don’t give a f*ck about looking good, so your friends change. […] Don’t rudely cut them off. Just slowly reduce contact with the ones who you don’t vibe with anymore.' },
  { theme: 'people', card: 'See your parents more.',
    head: 'Spend more time with your parents than feels normal. Soon they’ll be gone.' },
];

const SCARS = [
  'personal bankruptcies', 'homeless friends', 'my battles with drugs and alcohol',
  'nearly getting knifed to death', 'friends in jail', 'job losses', 'mental illness',
  '$1.2M theft', 'online trolling', 'going from entrepreneur to corporate to entrepreneur, etc.',
];

module.exports = { THEMES, LESSONS, SCARS };
