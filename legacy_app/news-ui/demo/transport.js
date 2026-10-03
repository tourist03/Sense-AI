import { makeArticles, makeResearch, taxonomy } from './fixtures.js';

export const DEMO_STORAGE_KEY='sense-ai-public-demo-v1';
const emptyState=()=>({saved:[],hidden:[],reactions:{},drafts:[],exports:[],watchlist:[],selected:[],preferences:{topics:['ai_models','devices_displays','cloud_platforms'],outcomes:['product_launches'],source_families:['research','tech_press'],regions:['balanced'],surprise_me:true,onboarding_completed:true},displayName:'Demo reader'});
const result=(body,status=200,headers={})=>({body,status,headers});
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const unavailable=()=>result({detail:'This action needs the full Python backend. The portfolio demo uses sample data and does not contact live AI, crawling or private services.'},501);
const keyOf=item=>item?.article_id || item?.id || item?.article_key || item?.link || item?.url || item?.title || '';

// A separate demo-only API. Neither the production frontend nor backend imports it.
export function createDemoApi({baseUrl='https://tourist03.github.io/Sense-AI/',storage,now=()=>new Date()}={}) {
  let state=emptyState();
  try { const saved=JSON.parse(storage?.getItem(DEMO_STORAGE_KEY)||'null'); if(saved)state={...state,...saved}; } catch { /* Memory-only mode is also usable. */ }
  const articles=makeArticles(baseUrl,now());
  const artifacts=makeResearch(baseUrl);
  const persist=()=>{try{storage?.setItem(DEMO_STORAGE_KEY,JSON.stringify(state));}catch{throw new Error('Browser storage is full or unavailable. Reset the demo or enable storage to save changes.');}};
  const savedArticles=()=>articles.filter(item=>state.saved.includes(item.id));
  const visibleArticles=()=>articles.filter(item=>!state.hidden.includes(item.id));
  const quota=()=>({limit:2,used:0,remaining:2,window_hours:6,server_now:now().getTime()/1000});
  const reaction=id=>({article_id:id,viewer_reaction:state.reactions[id]||'neutral',like_count:state.reactions[id]==='like'?1:0,dislike_count:state.reactions[id]==='dislike'?1:0});

  async function handle(path,{method='GET',body={}}={}) {
    const url=new URL(path,baseUrl), route=url.pathname, write=method!=='GET';
    if(route==='/access-control/capabilities')return result({capabilities:['review.news.submit'],privileged_session_active:false,session_role:'',demo:true});
    if(route==='/viewer/profile') {
      if(write){state.displayName=String(body.display_name||state.displayName).slice(0,60);persist();}
      return result({display_name:state.displayName,principal:'publicdemobrowser',demo:true});
    }
    if(route==='/viewer/recommendation-status')return result({enabled:true,mode:'configured',taxonomy,event_flush_seconds:15,event_batch_size:10,demo:true});
    if(route.startsWith('/viewer/preferences')) {
      if(write){state.preferences=route.endsWith('/reset')?emptyState().preferences:{...state.preferences,...body,onboarding_completed:true};persist();}
      return result({preferences:{...state.preferences,completed_at:'2026-10-03T00:00:00Z'},mode:'configured',demo:true});
    }
    if(route==='/viewer/for-you')return result({items:visibleArticles().sort((a,b)=>Number(state.preferences.topics?.includes(b.topic))-Number(state.preferences.topics?.includes(a.topic))),total:visibleArticles().length,cursor:null,feed_request_id:'public-demo',mode:'configured',demo:true});
    if(['/latest-briefing','/briefing/shared/latest'].includes(route))return result({result:articles,articles,demo:true});
    if(route==='/briefing/meta')return result({total:articles.length,timestamp:now().toISOString(),demo:true});
    if(route==='/viewer/saved'||route==='/viewer/saved/remove') {
      if(write){const item=body.article||body,id=keyOf(item);state.saved=state.saved.filter(key=>key!==id);if(!route.endsWith('/remove')&&articles.some(item=>item.id===id))state.saved.push(id);persist();}
      return result({status:'success',items:savedArticles(),demo:true});
    }
    if(route==='/viewer/hidden'||route==='/viewer/hidden/restore') {
      if(write){const id=keyOf(body.article||body);state.hidden=state.hidden.filter(key=>key!==id);if(!route.endsWith('/restore'))state.hidden.push(id);persist();}
      return result({status:'success',items:articles.filter(item=>state.hidden.includes(item.id)),demo:true});
    }
    if(route==='/viewer/reactions/query')return result({status:'success',reactions:Object.fromEntries((body.article_ids||[]).map(id=>[id,reaction(id)])),demo:true});
    if(route==='/viewer/reactions') {const id=keyOf(body.article);state.reactions[id]=['like','dislike'].includes(body.reaction)?body.reaction:'neutral';persist();return result({status:'success',...reaction(id),reaction:reaction(id),demo:true});}
    if(route==='/viewer/following')return result({threads:savedArticles().map(item=>({id:item.id,anchor:item,anchor_article:item,latest:item,items:[item],updates:[item],title:item.title,saved_at:now().toISOString()})),demo:true});
    if(route==='/viewer/activity-summary')return result({activity:{news_read:{today:0,yesterday:0,trend_percent:0,trend_state:'flat'},likes:{this_week:Object.values(state.reactions).filter(value=>value==='like').length,last_week:0,trend_percent:0,trend_state:'flat'},following:{total:state.saved.length},active_days:{this_month:0,total_30d:0}},demo:true});
    if(['/viewer/recommendation-events','/track'].includes(route))return result({status:'success',demo:true}); // No telemetry is stored or sent.
    if(route==='/viewer/briefings')return write?unavailable():result({jobs:[],items:[],demo:true});
    if(route==='/viewer/personalization')return result({enabled:true,preferences:state.preferences,demo:true});
    if(route==='/workflow')return result({selected:articles.filter(item=>state.selected.includes(item.id)),approved:[],demo:true});
    if(route==='/workflow/select'||route==='/workflow/import'){const items=route.endsWith('/import')?body.items||[]:[body];for(const item of items){const id=keyOf(item);if(!state.selected.includes(id))state.selected.push(id);}persist();return result({selected:articles.filter(item=>state.selected.includes(item.id)),approved:[],status:'success',demo:true});}
    if(route==='/archive/search') {
      const query=(url.searchParams.get('query')||url.searchParams.get('q')||'').toLowerCase();
      const from=url.searchParams.get('from_date'),to=url.searchParams.get('to_date'),source=(url.searchParams.get('target_sites')||'').toLowerCase();
      const found=visibleArticles().filter(item=>query.split(/\s+/).filter(Boolean).every(term=>`${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(term))&&(!from||item.date>=from)&&(!to||item.date<=to)&&(!source||item.src.toLowerCase().includes(source)));
      if(url.searchParams.get('sort')==='newest')found.sort((a,b)=>b.published.localeCompare(a.published));
      const offset=Math.max(0,Number(url.searchParams.get('offset'))||0),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||20)),items=found.slice(offset,offset+limit);
      return result({items,results:items,result:items,total:found.length,demo:true});
    }
    if(route==='/archive/article'){const item=articles.find(item=>item.url===url.searchParams.get('url')||item.link===url.searchParams.get('link')||item.title===url.searchParams.get('title'));return item?result({article:item,result:item,...item,demo:true}):result({detail:'Sample article not found.'},404);}
    if(route==='/insight')return result({insight:'Sample perspective: compare evidence, implementation constraints and the next validation step. This prewritten illustration does not call a model.',demo:true});
    if(route.startsWith('/history/list'))return result({files:[],items:[],demo:true});
    if(route==='/internal-content/samsung-feed')return result({global:articles.filter(item=>item.title.includes('Samsung')&&item.region==='Global'),local:articles.filter(item=>item.title.includes('Samsung')&&item.region==='India'),inside:[],articles:articles.filter(item=>item.title.includes('Samsung')),demo:true});
    if(route==='/internal-content/published')return result({items:[],records:[],demo:true});
    if(route==='/internal-content/notifications')return result({items:[],notifications:[],unread_count:0,demo:true});
    if(route==='/internal-content/contribute-access')return result({allowed:false,demo:true});
    if(route==='/translation/status')return result({available:false,enabled:false,reason:'Translation requires the full backend and local translation model. This demo stays in English.',demo:true});
    if(route==='/venture-lens/discovery')return result({featured:artifacts,stream:artifacts,lanes:Object.fromEntries(['papers','repositories','models','datasets','patents'].map((kind,i)=>[kind,artifacts.filter(item=>item.kind===['paper','repository','model','dataset','patent'][i])])),providers:{github:{available:true,label:'Fictional sample'},arxiv:{available:true,label:'Fictional sample'},epo:{available:false}},demo:true});
    if(route==='/venture-lens/intelligence')return result({watchlist:state.watchlist,radar:[],briefs:[],repositories:artifacts.filter(item=>item.kind==='repository'),papers:artifacts.filter(item=>item.kind==='paper'),demo:true});
    if(route.startsWith('/venture-lens/dossier/')){const id=decodeURIComponent(route.split('/').at(-1)),artifact=artifacts.find(item=>item.id===id);return artifact?result({...artifact,overview:artifact.summary,description:artifact.summary,demo:true}):result({detail:'This sample dossier is not available.'},404);}
    if(route==='/venture-lens/watchlist/toggle'){const key=`${body.kind}:${body.id}`;const active=state.watchlist.some(item=>item.key===key);state.watchlist=state.watchlist.filter(item=>item.key!==key);if(!active)state.watchlist.push({...body,key});persist();return result({watchlist:state.watchlist,watched:!active,demo:true});}
    if(route==='/reports/status')return result({quota:quota(),template:{available:false},demo:true});
    if(route==='/reports/analysis')return result({analysis:'SAMPLE ANALYSIS — prewritten demonstration, not live AI.\n\nThese fictional stories illustrate how the workspace brings multiple sources into a single editorial document. Compare the evidence, device constraints and validation steps before drawing a conclusion. Edit this passage to try the report tools.',cached:true,demo:true});
    if(route==='/reports/impact')return result({impact:'SAMPLE IMPACT — prewritten demonstration, not live AI.\n\nThis fictional example illustrates where a team could consider product relevance, integration constraints and the next experiment. It contains no real Samsung assessment or internal information.',quota:quota(),cached:true,demo:true});
    if(route==='/reports/ask')return result({answer:'SAMPLE ANSWER — this fixed response demonstrates the Ask AI interface. No external request or live inference occurs.',replacement:'Sample passage: collect evidence, test assumptions and document the remaining uncertainty.',sources:[],quota:quota(),demo:true});
    if(route==='/reports/drafts'&&write){if(String(body.html||'').length>1_500_000)return result({detail:'This demo supports reports up to 1.5 MB.'},413);const id=body.id||`demo-draft-${now().getTime()}`,existing=state.drafts.find(item=>item.id===id);if(existing&&Number(body.revision)!==existing.revision)return result({detail:'This draft changed in another tab. Reopen it from history.'},409);const draft={id,title:String(body.title||'Sample report').slice(0,200),html:String(body.html||''),revision:(existing?.revision||0)+1,updated_at:now().getTime()/1000};state.drafts=[draft,...state.drafts.filter(item=>item.id!==id)].slice(0,5);persist();return result(draft);}
    if(route.startsWith('/reports/drafts/')){const id=route.split('/').at(-1),draft=state.drafts.find(item=>item.id===id);if(method==='DELETE'){state.drafts=state.drafts.filter(item=>item.id!==id);persist();return result({status:'success'});}return draft?result(draft):result({detail:'Sample draft not found.'},404);}
    if(route==='/reports/history')return result({drafts:state.drafts.map(({html,...draft})=>draft),exports:state.exports,demo:true});
    if(route==='/reports/export/html') {
      // Export as text so pasted markup cannot run scripts when the downloaded document opens.
      const html=`<!doctype html><meta charset="utf-8"><title>${escape(body.title)}</title><style>body{max-width:850px;margin:40px auto;padding:24px;font:16px/1.7 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>${escape(body.title)}</h1><p>Sense.AI portfolio demo · fictional sample data · prewritten AI text</p><pre>${escape(String(body.html||'').replace(/<[^>]*>/g,'\n'))}</pre>`;
      state.exports=[{title:body.title,format:'html',at:now().getTime()/1000},...state.exports].slice(0,20);persist();return result(html,200,{'Content-Type':'text/html;charset=utf-8'});
    }
    if(route.startsWith('/reports/export/'))return result({detail:'This browser-only demo supports HTML export. PDF, Word, Excel and PowerPoint exports require the full Python backend.'},501);
    if(route==='/status')return result({status:'sample-data',demo:true});
    return unavailable();
  }
  return {handle};
}

export function resetDemo(){try{window.localStorage.removeItem(DEMO_STORAGE_KEY);}catch{}}

export function installDemoTransport() {
  const nativeFetch=window.fetch.bind(window);
  const baseUrl=new URL(import.meta.env.BASE_URL,window.location.origin).href;
  const api=createDemoApi({baseUrl,storage:window.localStorage});
  window.fetch=async(input,options={})=>{
    if(options.signal?.aborted)throw new DOMException('Request aborted','AbortError');
    const request=input instanceof Request?input:null;
    const url=new URL(request?.url||String(input),window.location.href);
    // Permit only this build's static assets and local file-parser blobs. API requests never reach a server.
    if(url.protocol==='blob:'||url.protocol==='data:'||(url.origin===window.location.origin&&url.pathname.startsWith(new URL(baseUrl).pathname)))return nativeFetch(input,options);
    if(url.origin!==window.location.origin)return new Response(JSON.stringify({detail:'External requests are disabled in this sample-data demo.'}),{status:501,headers:{'Content-Type':'application/json'}});
    let body={};try{body=JSON.parse(options.body||(request?await request.clone().text():'')||'{}');}catch{}
    let response;
    try{response=await api.handle(url.href,{method:options.method||request?.method||'GET',body});}catch(error){response=result({detail:error.message},507);}
    if(options.signal?.aborted)throw new DOMException('Request aborted','AbortError');
    return new Response(typeof response.body==='string'?response.body:JSON.stringify(response.body),{status:response.status,headers:{'Content-Type':'application/json',...response.headers}});
  };
}
