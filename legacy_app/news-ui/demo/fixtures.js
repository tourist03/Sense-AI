export const taxonomy = {
  topics: [
    {id:'ai_models',label:'AI & language models'}, {id:'devices_displays',label:'Devices & displays'},
    {id:'semiconductors',label:'Semiconductors'}, {id:'cloud_platforms',label:'Cloud & software'},
    {id:'policy_markets',label:'Policy & markets'},
  ],
  outcomes: [{id:'product_launches',label:'Product direction'}, {id:'competitive_moves',label:'Competitive signals'}, {id:'risks_incidents',label:'Risks & reliability'}],
  source_families: [{id:'research',label:'Research'}, {id:'tech_press',label:'Technology press'}, {id:'primary',label:'Primary sources'}],
  regions: [{id:'balanced',label:'Balanced'}, {id:'global',label:'Global'}, {id:'india',label:'India'}],
};

const storySpecs = [
  ['Smaller models make room for on-device assistants','AI & ML','Global','ai_models','ai','An illustrative device team explores a compact language model, local retrieval and a strict memory budget.','Local inference keeps selected tasks close to the device.','Evaluate memory use alongside answer quality.'],
  ['A new display concept brings adaptive interfaces into focus','Display','Global','devices_displays','display','A fictional display lab combines responsive layouts with context-aware viewing modes.','The interface changes with the viewing environment.','Design for remote navigation, distance and accessibility.'],
  ['Chip designers weigh throughput against energy use','Semiconductor','India','semiconductors','chip','A sample engineering team compares two accelerator layouts under the same thermal envelope.','Efficient movement of data matters as much as compute.','Measure sustained performance rather than a peak benchmark.'],
  ['Retrieval turns scattered engineering notes into useful context','AI & ML','India','ai_models','ai','A fictional knowledge assistant indexes a small collection of public-style engineering notes and returns source-backed passages.','Retrieval connects a question to relevant evidence.','Keep source attribution and uncertainty visible.'],
  ['An asynchronous pipeline keeps a shared briefing responsive','Software','Global','cloud_platforms','network','This example separates collection, normalization and presentation into a bounded background pipeline.','Readers can explore existing material while collection runs separately.','Bound concurrency and retain useful failure diagnostics.'],
  ['Samsung demo: A TV experience adapts to the living room','Display','Global','devices_displays','display','Fictional sample coverage demonstrates how the Samsung News channel presents a TV platform story. This is not a real company announcement.','A television interface must support consistent native and web behavior.','Check playback, rendering and memory at the integration boundary.'],
  ['Research teams compare semantic similarity strategies','AI & ML','Global','ai_models','network','Two fictional research groups compare embedding-based grouping with keyword matching on a small demonstration corpus.','Similar wording and similar meaning are different signals.','Inspect clusters and preserve source evidence.'],
  ['Samsung demo: A regional developer workshop shares lessons','Software','India','cloud_platforms','chip','A fictional workshop story illustrates the local news channel. It contains no actual employee, event or internal information.','A shared briefing can organize lessons across technical teams.','Keep public knowledge separate from private contribution records.'],
  ['Reliable services start with clear timeout and retry rules','Software','Global','cloud_platforms','network','This fictional backend case study compares bounded requests, idempotent retries and observable failure states.','A timeout is a product behavior as well as an infrastructure setting.','Give users a useful recovery path without duplicate work.'],
];

export function makeArticles(baseUrl='https://tourist03.github.io/Sense-AI/',now=new Date()) {
  return storySpecs.map(([headline,category,region,topic,art,summary,changed,next],index)=> {
    const date = new Date(now); date.setHours(11-index,30,0,0); if(index>5)date.setDate(date.getDate()-1);
    const id=`demo-story-${index+1}`;
    const url=new URL(`sources.html#${id}`,baseUrl).href;
    const cover=new URL(`art/${art}.svg`,baseUrl).href;
    return {id,article_id:id,article_key:id,title:`Sample: ${headline}`,summary:summary+' This is prewritten demonstration content.',summary_lead:summary,
      summary_points:[changed,next,'Fictional sample — not a live news report.'],summary_format:'structured',master_summary:summary,
      summarized_by:'Prewritten demo fixture',why_it_matters:`Sample perspective: ${next} This is illustrative text, not generated advice.`,
      src:index%2?'Example Research Desk':'Demo Technology Journal',source:index%2?'Example Research Desk':'Demo Technology Journal',sources:[{name:'Demo Technology Journal',link:url}],
      source_count:1,published:date.toISOString(),date:date.toISOString().slice(0,10),time:'11:30',category,region,keywords:[topic,category],keywords_found:[topic],
      importance:0.94-index*.035,importance_score:0.94-index*.035,conf:0.94-index*.035,top_image:cover,image_url:cover,link:url,url,canonical_link:url,
      is_fresh:index<5,vertical:'technology',verticals:['technology'],source_family:'research',topic,
      what_changed:changed,why_now:'An example of the context shown in a dossier.',watch_next:next,attention_hook:changed,
      recommendation:{reasons:['Sample mix based on your selected topics'],reason_codes:['demo_fixture']},personalization:{reason:'Sample topic match'},
    };
  });
}

export function makeResearch(baseUrl='https://tourist03.github.io/Sense-AI/') {
  return [
    {id:'demo-edge-toolkit',kind:'repository',title:'Sample: Edge Model Toolkit',category:'On-device AI',source:'Fictional repository',summary:'A sample artifact for exploring efficient inference and memory measurement. All displayed metrics are fictional demo values.',url:new URL('sources.html#research',baseUrl).href,stars:128,language:'Python',metrics:{stars:128},demo:true},
    {id:'demo-retrieval-paper',kind:'paper',title:'Sample: Retrieval under a memory budget',category:'Information retrieval',source:'Fictional research paper',summary:'A prewritten research example comparing retrieval strategies within a constrained device.',url:new URL('sources.html#research',baseUrl).href,citations:24,metrics:{citations:24},demo:true},
    {id:'demo-embedding-model',kind:'model',title:'Sample: Compact embedding model',category:'Embeddings',source:'Fictional model card',summary:'A sample model artifact illustrating the discovery and comparison interface.',url:new URL('sources.html#research',baseUrl).href,downloads:640,metrics:{downloads:640},demo:true},
    {id:'demo-device-data',kind:'dataset',title:'Sample: Device interaction corpus',category:'Interface evaluation',source:'Fictional dataset',summary:'An invented dataset card. No actual internal device logs or records are included.',url:new URL('sources.html#research',baseUrl).href,downloads:90,metrics:{downloads:90},demo:true},
  ];
}
