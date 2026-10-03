import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoApi, DEMO_STORAGE_KEY } from '../demo/transport.js';
import { makeArticles } from '../demo/fixtures.js';

const now=()=>new Date('2026-10-03T10:00:00Z');
const memoryStorage=()=>{const map=new Map();return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};};

test('public demo fixtures are fictional and all source/media links stay within the demo',()=>{
  const articles=makeArticles('https://example.test/Sense-AI/',now());
  assert.equal(articles.length,9);
  for(const article of articles){assert.ok(article.title.startsWith('Sample: '));assert.ok(article.url.startsWith('https://example.test/Sense-AI/sources.html'));assert.ok(article.image_url.startsWith('https://example.test/Sense-AI/art/'));}
});

test('sample saved and hidden stories persist only in the supplied browser store',async()=>{
  const storage=memoryStorage(),api=createDemoApi({storage,now});
  const article=(await api.handle('/latest-briefing')).body.articles[0];
  await api.handle('/viewer/saved',{method:'POST',body:article});
  await api.handle('/viewer/hidden',{method:'POST',body:article});
  assert.equal((await api.handle('/viewer/saved')).body.items.length,1);
  assert.equal((await api.handle('/viewer/for-you')).body.items.length,8);
  const reopened=createDemoApi({storage,now});
  assert.equal((await reopened.handle('/viewer/saved')).body.items.length,1);
  const separate=createDemoApi({storage:memoryStorage(),now});
  assert.equal((await separate.handle('/viewer/saved')).body.items.length,0);
  const activity=(await api.handle('/viewer/activity-summary')).body.activity;
  assert.equal(activity.following.total,1);
  assert.equal(activity.news_read.today,0);
  assert.ok(storage.getItem(DEMO_STORAGE_KEY));
});

test('sample reactions are reversible and telemetry is not persisted',async()=>{
  const storage=memoryStorage(),api=createDemoApi({storage,now}),article=(await api.handle('/latest-briefing')).body.articles[0];
  await api.handle('/viewer/reactions',{method:'PUT',body:{article,reaction:'like'}});
  assert.equal((await api.handle('/viewer/reactions/query',{method:'POST',body:{article_ids:[article.id]}})).body.reactions[article.id].like_count,1);
  await api.handle('/viewer/reactions',{method:'PUT',body:{article,reaction:'neutral'}});
  assert.equal((await api.handle('/viewer/reactions/query',{method:'POST',body:{article_ids:[article.id]}})).body.reactions[article.id].like_count,0);
  const before=storage.getItem(DEMO_STORAGE_KEY);
  await api.handle('/track',{method:'POST',body:{private:'discard me'}});
  assert.equal(storage.getItem(DEMO_STORAGE_KEY),before);
});

test('live service operations fail explicitly and sample AI identifies itself',async()=>{
  const api=createDemoApi({now});
  for(const path of ['/crawl','/scheduler/run','/access-control/session/unlock','/unrecognized-api'])assert.equal((await api.handle(path,{method:'POST'})).status,501);
  assert.match((await api.handle('/reports/analysis',{method:'POST'})).body.analysis,/prewritten demonstration, not live AI/);
  assert.equal((await api.handle('/reports/export/pdf',{method:'POST'})).status,501);
});

test('demo archive search uses the real query contract and supports empty results and source filters',async()=>{
  const api=createDemoApi({now});
  const search=(await api.handle('/archive/search?query=memory')).body;
  assert.equal(search.total,1);
  assert.ok(search.items.every(item=>`${item.title} ${item.summary}`.includes('memory')));
  assert.equal((await api.handle('/archive/search?query=absentword')).body.total,0);
  assert.equal((await api.handle('/archive/search?query=memory&target_sites=Example')).body.total,0);
});

test('browser-local drafts enforce revisions and HTML export cannot execute pasted markup',async()=>{
  const api=createDemoApi({storage:memoryStorage(),now});
  const draft=(await api.handle('/reports/drafts',{method:'POST',body:{title:'Sample report',html:'<h2>Hello</h2><script>alert(1)</script>'}})).body;
  assert.equal(draft.revision,1);
  assert.equal((await api.handle('/reports/drafts',{method:'POST',body:{...draft,revision:0}})).status,409);
  const exported=await api.handle('/reports/export/html',{method:'POST',body:draft});
  assert.match(exported.headers['Content-Type'],/text\/html/);
  assert.ok(!exported.body.includes('<script>'));
  assert.equal((await api.handle('/reports/history')).body.exports.length,1);
});
