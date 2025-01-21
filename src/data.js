export const nodeType = {
    leader: '👑',           // 部落首领、公、侯、部落大汗、起义军首领
    king: '⭐️',            // 国王、皇帝
    literati: '📚',         // 文学家、诗人、词人、小说家、著名学者、戏剧作家、翻译家
    scientist: '🔬',        // 科技类名人（天文学家、数学家、医学家、机械专家、农学家等）
    politician: '⚖️',       // 政治家、著名宰臣、名相、名臣、重臣
    historian: '📜',        // 史学家
    philosopher: '🤔',      // 思想家、哲学家
    revolutionary: '✊',     // 改革家、革命家
    military: '⚔️',         // 军事家、战略家
    general: '🎯',          // 军事将领、统帅及著名战役
    monk: '🙏',             // 经师、佛教或道教理论家、经学家
    artist: '🎨',           // 书法家、画家、音乐家等
    capital: '🏛️',          // 国都
    event: '⭕️',           // 重要、著名的历史事件
    longEvent: '➖',        // 持续1年以上的著名事件
    development: '⬆️',      // 某事物在所注朝代有一定发展
    majorDev: '⬆️⬆️',       // 有较大发展或很发达
    ethnic: '⬜️',          // 某民族或某事物在所注朝代出现或产生
    ethnicDev: '⬜️⬆️',      // 并有一定发展
    educator: '🎓',         // 教育家、外交家、社会学家等
    other: '📌',           // 其他类历史名人
};



const data = [
    {
      startYear: -3000,
      endYear: -2070,
      regions: [
        { label: '远古',
            events: [
                { year: -2900, text: "尧", type: 'leader'},
                { year: -2800, text: "舜", type: 'leader'},
                { year: -2700, text: "大禹治水", type: 'longEvent'},
            ]
         },
      ],
    },
    {
        startYear: -2070,
        endYear: -1600,
        regions: [
            { label: '夏',
                events: [
                    { year: -2070, text: "禹", type: 'leader'},
                    {year:-2060,text:"划天下为九州",type:'event'},
                    {year:-2050,text:"相传，阳城",type:'capital'},
                    {year:-2020,text:"迁，阳翟",type:'capital'},
                    {year:-1990,text:"逐步建立了军队、刑法、监狱，设立了官职，进入了奴隶社会",type:'event'},
                    {year:-1950,text:"启",type:'leader'},
                    {year:-1940,text:"废禅让制，立世袭制",type:'event'},
                    {year:-1900,text:"太康",type:'capital'},
                    {year:-1850,text:"少康",type:'leader'},
                    {year:-1800,text:"少康中兴",type:'event'},
                    {year:-1700,text:"青铜器",type:'development'},
                    {year:-1600,text:"夏朝灭亡",type:'event'},
                ]
            },
        ]
    },
    {
        startYear: -1600,
        endYear: -1046,
        regions: [
            { label: '商',
                events: [
                    {year:-1600,text:"商汤",type:'leader'},
                    {year:-1500,text:"盘庚迁都",type:'event'},
                    {year:-1250,text:"武丁",type:'leader'},
                    {year:-1200,text:"武丁中兴",type:'event'},
                ]
            },
        ]
    },
    {
        startYear: -1046,
        endYear: -781,
        regions: [
            { label: '西周',
                events: [
                    
                        {year: -788, text: "中央设两大", type: 'event'},
                        {year: -788, text: "料民拓原", type: 'event'},
                        {year: -877, text: "历王专制", type: 'event'},
                        {year: -885, text: "周宣王共和行政", type: 'event'},
                        {year: -976, text: "周孝王", type: 'leader'},
                        {year: -995, text: "周康王", type: 'leader'},
                        {year: -1020, text: "国人暴动", type: 'event'},
                        {year: -1020, text: "召穆公(召虎)", type: 'leader'}
                    
                ]
            },
        ]
    },
    {
        startYear: -781,
        endYear: -478,
        regions: [
            { label: '燕国',
                events: [
                    {year:-690,text:"燕庄公",type:'leader'},
                ]
            },
            { label: '楚国',
                events: [
                    {year:-740,text:"楚武王",type:'leader'},
                    {year:-700,text:"楚文王",type:'leader'},
                    {year:-690,text:"楚成王",type:'leader'},
                ]
            },
            { label: '齐国',
                events: [
                    {year:-697,text:"齐襄公",type:'leader'},
                    {year:-685,text:"齐桓公",type:'leader'},
                    {year:-686,text:"管仲",type:'politician'},
                ]
            },
            { label: '晋国',
                events: [
                    {year:-676,text:"晋献公",type:'leader'},
                    {year:-636,text:"晋文公",type:'leader'},
                    {year:-632,text:"成为中原霸主",type:'event'},
                ]
            },
        ]
    }
  ];

  export default data;