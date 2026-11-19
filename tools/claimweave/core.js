/* ClaimWeave v3.0: deterministic, inspectable reconciliation and validation.
   No document or personal information is sent to a server. Any suggestions
   are evidence leads, not proof of payment, policy compliance or approval. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.ClaimWeaveCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const currencies=['GBP','CNY','INR','EUR','USD','HKD','JPY','AED','SGD'];
const titleWords=['taxi','transport','airport','transfer','flight','hotel','accommodation','train','rail','meal','food','subsistence','conference','registration'];
const paymentWords=/\b(paid|payment|charge[ds]?|settle[ds]?|cash|bank transfer|card charge|transaction|settled)\b/i;
const negativeApproval=/\b(not approved|not authorised|not authorized|cannot approve|do not approve|subject to approval|pending approval|approval required|not yet approved)\b/i;
const approvalRegex=/\b(?:yes,?\s*)?(?:approved|authori[sz]ed|you (?:may|can) claim|can be reimbursed|reimbursement is approved|confirmed for reimbursement|please proceed)\b/i;
function positive(v){return v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>0;}
function numeric(v){return Number.isFinite(Number(v))?Number(v):0;}
function money(v){return Math.round((numeric(v)+Number.EPSILON)*100)/100;}
function roundAmount(v){return money(v).toFixed(2);}
function currencyFrom(text, fallback='GBP'){
 const t=String(text||'');
 if(/\b(?:CNY|RMB|yuan)\b|[￥¥]|(?:人民币|元整)/i.test(t))return 'CNY';
 if(/\bINR\b|₹/i.test(t))return 'INR';
 if(/\bHKD\b/i.test(t))return 'HKD';
 if(/\bJPY\b/i.test(t))return 'JPY';
 if(/\bAED\b/i.test(t))return 'AED';
 if(/\bSGD\b/i.test(t))return 'SGD';
 if(/\bUSD\b|\bUS\$/i.test(t))return 'USD';
 if(/\bEUR\b|€/i.test(t))return 'EUR';
 if(/\bGBP\b|£|pound sterling/i.test(t))return 'GBP';
 return fallback;
}
function classify(name='',text='',extension=''){
 const norm=String(name||'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[._-]+/g,' ');
 const n=`${norm} ${String(text||'').slice(0,1800)}`.toLowerCase();
 if(/(?:\bfx\b|\bexchange\b|exchange[ _-]?rate|currency[ _-]?conversion|xe\.com|yuan.*pound sterling|cny.*gbp)/.test(n))return 'Exchange rate';
 if(/\b(?:approved|approval|authoris(?:ed|ation)|authoriz(?:ed|ation)|you may claim|can claim|permission)\b/.test(n))return 'Approval';
 if(/\b(?:invoice|e[ -]?invoice|发票|billing)\b/.test(n))return 'Invoice';
 if(/(?:\bstmt\b|statement|fee[ _-]?stmt|receipt[ _-]?statement|汇总单|transfer[ _-]?fee[ _-]?statement|transport[ _-]?fee[ _-]?statement)/.test(n))return 'Statement';
 if(/\b(?:booking|boarding|ticket|itinerary|reservation)\b/.test(n))return 'Booking / ticket';
 if(['msg','eml'].includes(extension.toLowerCase()))return 'Correspondence';
 if(/\b(?:receipt|taxi|parking|bill|hotel|train|restaurant|uber)\b/.test(n))return 'Receipt';
 if(['jpg','jpeg','png'].includes(extension.toLowerCase()))return 'Receipt';
 return 'Other';
}
function amountCandidates(text,contextLimit=120){
 const t=String(text||'').replace(/\r/g,'');if(!t.trim())return [];
 const lines=t.split('\n');const out=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i].slice(0,900);
  const regex=/(?:\b(CNY|RMB|GBP|INR|EUR|USD|HKD|JPY|AED|SGD)\b\s*|([£€¥￥₹])\s*)?(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d{1,7}(?:\.\d{1,2})?)(?:\s*(?:元整|元))?/ig;
  let m;while((m=regex.exec(line))!==null){
   const raw=m[3].replace(/,/g,'');const value=Number(raw);
   if(!Number.isFinite(value)||value<=0||value>2e7)continue;
   const adjacent=(lines[Math.max(0,i-1)]+' '+line+' '+(lines[i+1]||'')).slice(0,1000);
   const hasCurrency=!!m[1]||!!m[2]||/人民币|元整|价税合计|小写|费[用額额]|合计/.test(adjacent);
   const hasAmountContext=/(?:\btotal\b|\bamount\b|\bpaid\b|\bfare\b|\bcharge\b|\bprice\b|\bfee\b|\bcost\b|subtotal|tax|合计|金额|价税|运费|人民币|现金|开票)/i.test(adjacent);
   if(!hasCurrency&&!hasAmountContext)continue;
   if(/^20\d{2}$/.test(raw)&&!hasCurrency)continue;
   // Invoice IDs and telephone numbers are not financial amounts.
   if(raw.length>=9&&raw.indexOf('.')<0)continue;
   const cur=m[1]?m[1].toUpperCase()==='RMB'?'CNY':m[1].toUpperCase():m[2]?({'£':'GBP','€':'EUR','¥':'CNY','￥':'CNY','₹':'INR'}[m[2]]):currencyFrom(adjacent,'');
   const context=line.trim().slice(0,contextLimit);
   const totalish=/\b(?:grand total|total amount|total payable|total charge|total cost|total|amount paid|fare paid)\b|价税合计|小写|合计|总费用|总金额/i.test(adjacent);
   const mark=/\b(?:total|subtotal|tax|fare|cost|charge|paid|amount)\b|合计|运费|价税/i.test(adjacent);
   const confidence=totalish?'high':mark?'medium':'low';
   out.push({value, currency:cur||'',line:i+1,context,confidence,source:'text'});
  }
 }
 const dedup=new Set();return out.filter(v=>{const key=[v.value,v.currency,v.line].join('|');if(dedup.has(key))return false;dedup.add(key);return true;}).slice(0,120);
}
function dateCandidates(text){
 const str=String(text||'');const found=[];
 let m;const iso=/\b(20\d{2})[-/.](0?[1-9]|1[012])[-/.](0?[1-9]|[12]\d|3[01])\b/g;
 while((m=iso.exec(str))&&found.length<40)found.push(`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`);
 const chinese=/(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;
 while((m=chinese.exec(str))&&found.length<50)found.push(`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`);
 const months={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
 const words=/\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?[,]?\s+(20\d{2})\b/ig;
 while((m=words.exec(str))&&found.length<60)found.push(`${m[3]}-${String(months[m[2].slice(0,3).toLowerCase()]).padStart(2,'0')}-${m[1].padStart(2,'0')}`);
 return [...new Set(found)];
}
function excerptApprovals(text){
 const src=String(text||'').replace(/\r/g,'');const sentences=src.split(/(?<=[.!?\n])\s+/).map(x=>x.trim()).filter(Boolean);
 return sentences.filter(x=>approvalRegex.test(x) && !negativeApproval.test(x) && x.length<800).slice(0,12).map(x=>({excerpt:x.slice(0,340),reviewed:false,type:'candidate'}));
}
function incidentalRedact(t){
 return String(t||'')
 .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email redacted]')
 .replace(/(?<!\d)(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]){2,4}\d{3,5}(?!\d)/g,m => m.replace(/\D/g,'').length>=9 ? '[phone redacted]':m);
}
function reasonAboutOverlap(expenses,files){
 const out=[],included=files.filter(f=>f.include && f.status==='ready');
 for(let i=0;i<expenses.length;i++)for(let j=i+1;j<expenses.length;j++){
  const a=expenses[i],b=expenses[j];if(!positive(a.amount)||!positive(b.amount)||a.currency!==b.currency)continue;
  const pairTitle=`${String(a.title||'').toLowerCase()} ${String(b.title||'').toLowerCase()}`;
  const tokens=titleWords.filter(t=>pairTitle.includes(t));
  const dateClose=!a.date||!b.date||a.date===b.date;
  if(Math.abs(numeric(a.amount)-numeric(b.amount))<.01&&dateClose&&(tokens.length>0||String(a.title).trim()===String(b.title).trim())){
   out.push({level:'review',code:'possible-duplicate-amount',message:`Possible duplicate: ${a.title} and ${b.title} are both ${a.currency} ${roundAmount(a.amount)}. Confirm these are separate costs before claiming both.`,expenses:[a.id,b.id]});
  }
 }
 const sourced=included.flatMap(f=>(f.amountCandidates||[]).map(a=>({...a,doc:f}))).filter(v=>v.currency&&v.value>0);
 for(const e of expenses){
  if(!positive(e.amount))continue;
  const records=sourced.filter(x=>x.doc.expenseId===e.id && x.currency===e.currency && Math.abs(x.value-numeric(e.amount))<.03);
  if(records.length)continue;
  const matches=sourced.filter(x=>x.currency===e.currency&&Math.abs(x.value-numeric(e.amount))<.03);
  if(matches.length && !included.some(f=>f.expenseId===e.id && f.id===matches[0].doc.id)){
   out.push({level:'review',code:'unlinked-evidence',message:`${e.title}: matching ${e.currency} ${roundAmount(e.amount)} appears in ${matches[0].doc.name}; review whether to link it.`,expenseId:e.id,fileId:matches[0].doc.id});
  }
 }
 // A summary or exchange-rate screenshot is evidence, not a new reimbursement line.
 for(const f of included){
  if(!['Statement','Exchange rate'].includes(f.kind))continue;
  if(f.expenseId==='general')continue;
  const e=expenses.find(x=>x.id===f.expenseId);
  if(e && (!included.some(z=>z.expenseId===e.id && ['Invoice','Receipt'].includes(z.kind)))){
   out.push({level:'review',code:'summary-only',message:`${f.name} is a ${f.kind.toLowerCase()}, not independent proof of a payable cost. Confirm the underlying journey(s).`,expenseId:e.id,fileId:f.id});
  }
 }
 // Evidence may show a summary that equals the sum of other component amounts.
 for(const f of included.filter(f=>f.kind==='Statement')){
  const nums=(f.amountCandidates||[]).filter(x=>x.currency);
  const shared=expenses.filter(e=>e.currency===currencyFrom(f.parsedText,e.currency)&&positive(e.amount));
  for(const x of nums){
   const list=shared.filter(e=>e.currency===x.currency).slice(0,15);
   if(list.length<2)continue;
   const sum=list.reduce((n,e)=>n+numeric(e.amount),0);
   if(Math.abs(sum-x.value)<.03){out.push({level:'info',code:'sum-matches-statement',message:`${f.name}: ${x.currency} ${roundAmount(x.value)} appears to equal the sum of ${list.length} entered costs. This is supporting evidence, not an extra claim.`,fileId:f.id});break;}
  }
 }
 // Duplicate invoice numbers may indicate reused evidence, even if files differ.
 const invoiceNo=/\b(?:invoice\s*(?:number|no\.?|#)|发票号码)\s*[:：#-]?\s*([0-9]{8,24})/i;
 const invSeen=new Map();for(const f of included){const m=String(f.parsedText||'').match(invoiceNo);if(!m)continue;
  if(invSeen.has(m[1]))out.push({level:'review',code:'duplicate-invoice-number',message:`Invoice number ${m[1]} appears in ${invSeen.get(m[1])} and ${f.name}. Check whether it was claimed twice.`,fileId:f.id});
  else invSeen.set(m[1],f.name);
 }
 // Cross-document timing prompts, not definitive forensic conclusions.
 for(const f of included){
  if(!f.parsedText)continue;
  const dates=dateCandidates(f.parsedText);
  const dated=(f.parsedText.match(/(?:signature|signed|签署|开票日期|dated)\s*[:：-]?\s*(?:.{0,60})/i)||[])[0];
  if(dated){
   const signed=dateCandidates(dated)[0];if(signed&&dates.some(d=>d>signed))out.push({level:'review',code:'document-date',message:`${f.name}: document references events after a possible signature/issue date (${signed}). Check chronology.`,fileId:f.id});
  }
 }
 return out;
}
function audit(expenses,files,metadata={}){
 const issues=[];
 const add=(level,code,message,extra={})=>issues.push({level,code,message,...extra});
 const included=files.filter(x=>x.include && x.status==='ready');
 if(!included.length)add('blocker','no-documents','Include at least one readable evidence document.');
 if(!expenses.length)add('blocker','no-expenses','Add at least one genuine reimbursable expense.');
 if(!metadata.claimant?.trim())add('review','missing-claimant','Add a claimant name to make the pack easier to process.');
 if(!metadata.context?.trim())add('review','missing-purpose','Add a business purpose or reason for the claim.');
 for(let i=0;i<expenses.length;i++){
  const e=expenses[i],prefix=`Expense ${i+1} (${e.title||'unnamed'})`;
  if(!String(e.title||'').trim())add('blocker','missing-title',`${prefix}: enter a description.`,{expenseId:e.id});
  if(!positive(e.amount))add('blocker','missing-original',`${prefix}: enter a positive original amount.`,{expenseId:e.id});
  if(!positive(e.claimedGBP))add('blocker','missing-gbp',`${prefix}: enter a positive GBP claim.`,{expenseId:e.id});
  if(!e.verified)add('blocker','unverified-ledger',`${prefix}: confirm the original cost and that this is a distinct expense.`,{expenseId:e.id});
  const links=included.filter(f=>f.expenseId===e.id);
  if(!links.length)add('blocker','missing-evidence',`${prefix}: link supporting evidence.`,{expenseId:e.id});
  else if(!links.some(f=>['Receipt','Invoice','Booking / ticket','Statement'].includes(f.kind)))add('review','weak-evidence',`${prefix}: only contextual evidence is linked, not an invoice, receipt or statement.`,{expenseId:e.id});
  if(e.currency!=='GBP'){
   if(!positive(e.fxRate)&&!String(e.rateSource||'').trim())add('blocker','missing-fx',`${prefix}: document how you converted ${e.currency} into GBP.`,{expenseId:e.id});
   if(positive(e.fxRate)&&positive(e.amount)&&positive(e.claimedGBP)&&Math.abs(numeric(e.amount)*numeric(e.fxRate)-numeric(e.claimedGBP))>0.06)add('blocker','bad-fx',`${prefix}: GBP claim does not reconcile with amount × rate.`,{expenseId:e.id});
   if(!String(e.rateSource||'').trim())add('review','missing-fx-source',`${prefix}: enter FX source/date or card-statement reference.`,{expenseId:e.id});
  } else if(positive(e.claimedGBP)&&positive(e.amount)&&Math.abs(numeric(e.amount)-numeric(e.claimedGBP))>0.06)add('review','gbp-variance',`${prefix}: claim differs from the GBP receipt amount. Explain why.`,{expenseId:e.id});
  if(!e.date)add('review','missing-date',`${prefix}: add the transaction or travel date.`,{expenseId:e.id});
 }
 const total=expenses.reduce((s,e)=>s+numeric(e.claimedGBP),0);
 if(expenses.length && total<=0)add('blocker','zero-total','Total claimed is £0.00 despite expense rows.');
 for(const f of files){
  if(f.status==='error')add('review','import-failed',`${f.name}: import failed. ${f.note||''}`,{fileId:f.id});
  if(!f.include && f.status==='ready'&&!f.hashDuplicate)add('info','excluded-file',`${f.name}: deliberately excluded from submission.`,{fileId:f.id});
  if(f.hashDuplicate)add('info','exact-duplicate',`${f.name}: identical-file duplicate excluded.`,{fileId:f.id});
  if(f.attachmentWarning)add('review','attachments-missing',`${f.name}: some embedded attachments were not imported.`,{fileId:f.id});
  if(f.manualPaste)add('review','manual-email',`${f.name}: manually pasted email. Verify against the original message.`,{fileId:f.id});
  if(f.approvalCandidates?.length && !f.approvalCandidates.some(a=>a.reviewed))add('review','unreviewed-approval',`${f.name}: approval wording was detected but has not been marked reviewed against the original.`,{fileId:f.id});
 }
 issues.push(...reasonAboutOverlap(expenses,files));
 if(metadata.destination==='ARU / BW'&&!included.some(f=>f.kind==='Approval'||(f.approvalCandidates||[]).length))add('review','no-approval-evidence','No approval evidence identified. Confirm whether your particular ARU/BW claim requires prior approval.');
 if(files.some(f=>/\bcash\b/i.test(f.parsedText||''))&&!included.some(f=>f.kind==='Payment proof'))add('review','cash-payment-proof','Cash payment mentioned. Check whether independent confirmation of payment is required.');
 if(files.reduce((sum,f)=>sum+numeric(f.file?.size),0)>80*1024*1024)add('review','large-files','Large input: your browser may run out of memory.');
 return issues;
}
function proposeLinks(files,expenses){
 const links=[];
 for(const f of files.filter(f=>f.include&&f.status==='ready')){
  if(f.expenseId!=='general')continue;
  const content=[f.name,f.parsedText||''].join(' ').slice(0,10000).toLowerCase();
  for(const e of expenses){
   const cur=String(e.currency||'');const value=numeric(e.amount);
   const a=(f.amountCandidates||[]).find(x=>x.currency===cur && value>0 && Math.abs(x.value-value)<.03);
   const tokens=String(e.title||'').toLowerCase().match(/[a-z]{4,}/g)||[];
   const overlap=tokens.some(t=>content.includes(t) && !['receipt','invoice','payment','expense'].includes(t));
   if(a || overlap){links.push({fileId:f.id,expenseId:e.id,score:(a?2:0)+(overlap?1:0),reason:a?`Amount ${cur} ${roundAmount(value)} matches`:'Similar description'});}
  }
 }
 return links.sort((a,b)=>b.score-a.score).slice(0,20);
}
function manifest(files,expenses,claim,issues){return {
 schema:'claimweave-manifest-v3',generatedAt:new Date().toISOString(),claim:{...claim},
 expenses:expenses.map(e=>({...e})),
 evidence:files.map(f=>({id:f.id,name:f.name,kind:f.kind,hashSha256:f.hash||null,included:!!f.include,linkedExpenseId:f.expenseId,size:f.file?.size||0,sourceEmailId:f.sourceEmailId||null,originalType:f.extension,manualPaste:!!f.manualPaste})),
 issues:issues.map(({level,code,message})=>({level,code,message})),
 note:'Manifests identify the local sources; they are not digital signatures or independent verification.'
};}
return {currencies,positive,numeric,money,roundAmount,currencyFrom,classify,amountCandidates,dateCandidates,excerptApprovals,incidentalRedact,reasonAboutOverlap,audit,proposeLinks,manifest};
});
