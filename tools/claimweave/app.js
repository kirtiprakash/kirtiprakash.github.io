/* ClaimWeave — browser-only reimbursement evidence assembler.
 * All uploaded data remains in memory. No fetch/XHR is made with file contents.
 * External libraries are used for local parsing and PDF composition.
 */
'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const state = { files: [], expenses: [], processing: false, exporting: false, sequence: 0, lastMode: 'draft', importWarnings: [] };
  const Core = window.ClaimWeaveCore; const Writer=window.ClaimWeavePdf;
  const ALLOWED = ['jpg','jpeg','png','pdf','eml','msg'];
  const ATTACHABLE = new Set(['jpg','jpeg','png','pdf']);
  const KINDS = ['Receipt','Invoice','Booking / ticket','Approval','Correspondence','Statement','Exchange rate','Payment proof','Other'];
  const CURRENCIES = ['GBP','CNY','INR','EUR','USD','HKD','JPY','AED','SGD','Other'];
  const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const asMoney = v => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(number(v));
  const ext = name => (name.split('.').pop() || '').toLowerCase();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const id = () => `f${++state.sequence}`;
  const setStatus = (text, error = false) => { const node = $('export-status'); node.textContent = text; node.classList.toggle('error', error); node.classList.toggle('success', !error && /complete|ready|downloaded/i.test(text)); };
  const shortName = name => name.length > 74 ? name.slice(0, 36) + '…' + name.slice(-34) : name;
  const fileSize = n => n > 1024*1024 ? (n/(1024*1024)).toFixed(1)+' MB' : Math.max(1,Math.round(n/1024))+' KB';

  function categoryFor(fileName, type, content='') { return Core.classify(fileName,content,type); }
  function inferCurrency(text) {
    const a = String(text || '').slice(0,6000);
    if (/\b(?:CNY|RMB)\b|[¥￥]/i.test(a)) return 'CNY';
    if (/\bINR\b|₹/i.test(a)) return 'INR';
    if (/\bEUR\b|€/i.test(a)) return 'EUR';
    if (/\bUSD\b|\bUS\s*\$|\bUS\$/.test(a)) return 'USD';
    if (/\bHKD\b/.test(a)) return 'HKD';
    if (/\bJPY\b/i.test(a)) return 'JPY';
    if (/\bAED\b/i.test(a)) return 'AED';
    if (/\bSGD\b/i.test(a)) return 'SGD';
    if (/\bGBP\b|£/.test(a)) return 'GBP';
    if (/\$(?=\s*\d)/.test(a)) return 'USD';
    return 'GBP';
  }
  function suggestedAmount(text) {
    const lines = String(text || '').replace(/\r/g,'').split(/\n/);
    const amount = /(?:£|\$|€|¥|₹|\b(?:GBP|CNY|RMB|INR|EUR|USD)\b)?\s*(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)(?!\d)/ig;
    for (const line of lines) {
      if (!/\b(?:grand total|total due|total paid|amount paid|amount charged|total amount|payment total|total|balance due|fare paid)\b/i.test(line)) continue;
      const amounts = [...line.matchAll(amount)].map(x => x[1]).filter(x => x && !/^\d{5,}$/.test(x));
      if (amounts.length) return amounts[amounts.length-1].replace(/,/g,'');
    }
    return '';
  }
  function suggestedDate(text) {
    const match = String(text || '').match(/\b(20\d{2})[-/.](0?[1-9]|1[012])[-/.](0?[1-9]|[12]\d|3[01])\b|\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[012])[-/.](20\d{2})\b/);
    if (!match) return '';
    const y = match[1] || match[6], m = match[2] || match[5], d = match[3] || match[4];
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  function cleanHtml(html) {
    const doc = new DOMParser().parseFromString(String(html||''),'text/html');
    doc.querySelectorAll('script,style,iframe,svg,object,canvas,form,noscript').forEach(n => n.remove());
    doc.querySelectorAll('br').forEach(n => n.replaceWith('\n'));
    doc.querySelectorAll('p,div,li,tr,blockquote').forEach(n => n.append('\n'));
    return (doc.body?.textContent || '').replace(/[\t ]+\n/g,'\n').replace(/\n{4,}/g,'\n\n\n').trim();
  }
  async function sha256(file) {
    if (!globalThis.crypto?.subtle) return null;
    const result = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return [...new Uint8Array(result)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function readPdfText(file) {
    const lib = window.pdfjsLib;
    if (!lib) return { text:'',note:'Text reading unavailable; the PDF can still be merged.' };
    try {
      lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await lib.getDocument({data}).promise;
      const pageCount = doc.numPages;
      let text = '';
      for(let pageNo=1;pageNo<=Math.min(pageCount,12);pageNo++){
        const page=await doc.getPage(pageNo);
        const content=await page.getTextContent();
        let line='',lastY=null; for(const item of content.items){const y=item.transform?.[5]; if(lastY!==null && typeof y==='number' && Math.abs(y-lastY)>3){text+='\n'+line;line='';}line+=(item.str||'')+(item.hasEOL?'\n':' ');if(item.hasEOL){text+='\n'+line;line='';lastY=null;}else if(typeof y==='number')lastY=y;}text+='\n'+line;
      }
      return {text,note:pageCount>12?'Text preview limited to first 12 pages; all pages will be preserved.':text.trim()?'':'Scanned PDF: enter details manually (OCR is not enabled).',pages:pageCount};
    } catch(e) { return {text:'',note:'PDF text could not be read, but the original pages will be included.'}; }
  }
  async function readEmail(file, kind) {
    if (kind === 'eml') {
      const mod = await import('https://esm.sh/postal-mime@2.7.4');
      const PostalMime = mod.default || mod.PostalMime || mod;
      if(typeof PostalMime.parse !== 'function') throw new Error('EML parser could not load. Check your connection.');
      const email = await PostalMime.parse(await file.arrayBuffer());
      const addresses = val => Array.isArray(val) ? val.map(x=>x.address || x.name || '').filter(Boolean).join(', ') : val?.address || val?.name || '';
      return {subject:email.subject || file.name,from:addresses(email.from),to:addresses(email.to),cc:addresses(email.cc),date:email.date || '',body:(email.text || cleanHtml(email.html) || '').trim(),attachments:(email.attachments||[]).filter(a=>a.content && a.filename).map(a=>({name:a.filename,content:a.content,type:a.mimeType||''}))};
    }
    const mod = await import('https://esm.sh/@kenjiuno/msgreader@1.28.0?bundle');
    const MsgReader = mod.default || mod.MsgReader;
    if(typeof MsgReader!=='function') throw new Error('Outlook MSG reader could not load. Check your connection.');
    const reader=new MsgReader(await file.arrayBuffer());
    const data=reader.getFileData();
    if(!data || data.error) throw new Error(data?.error || 'Cannot decode this Outlook MSG file.');
    const items=[];
    for(const a of data.attachments||[]) {
      try {const att=reader.getAttachment(a);if(att?.content)items.push({name:att.fileName||a.fileName||'attachment',content:att.content,type:''});}catch(e) { /* Attachment issues recorded below via an explicit warning. */ }
    }
    const recipients=(data.recipients||[]).filter(x=>!x.recipType || x.recipType==='to').map(r=>r.email||r.name).filter(Boolean).join(', ');
    return {subject:data.subject||file.name,from:data.senderEmail||data.senderName||'',to:recipients,cc:(data.recipients||[]).filter(x=>x.recipType==='cc').map(r=>r.email||r.name).join(', '),date:data.clientSubmitTime||data.messageDeliveryTime||data.creationTime||'',body:(data.body||cleanHtml(data.bodyHTML||data.html)||'').trim(),attachments:items,attachmentWarning:(data.attachments||[]).length!==items.length};
  }
  function findMatchingExpense(doc) {
    if(!doc.suggestedAmount) return null;
    return state.expenses.find(e => e.amount && Math.abs(Number(e.amount)-Number(doc.suggestedAmount))<.01 && e.currency===doc.suggestedCurrency && (!doc.suggestedDate || !e.date || doc.suggestedDate===e.date));
  }
  function makeExpense(name='New expense',sug={}) {
    const ex={id:id(),title:name,date:sug.date||'',amount:sug.amount||'',currency:sug.currency||'GBP',fxRate:'',claimedGBP:sug.currency==='GBP' ? (sug.amount||''):'',rateSource:'',note:'',suggested:Boolean(sug.amount),verified:false};
    state.expenses.push(ex);return ex;
  }
  async function addFiles(files, sourceEmailId=null) {
    if(state.processing) return;
    state.processing=true;
    $('upload-progress').hidden=false;
    const list=Array.from(files);
    const errors=[];
    for(let i=0;i<list.length;i++){
      const f=list[i];
      $('upload-progress').textContent=`Reading ${i+1} of ${list.length}: ${shortName(f.name)}`;
      if(!ALLOWED.includes(ext(f.name))){const message=`${f.name}: unsupported format`;errors.push(message);state.importWarnings.push(message);continue;}
      try{await addFile(f,sourceEmailId);}catch(e){const message=`${f.name}: ${e.message}`;errors.push(message);state.importWarnings.push(message);}
    }
    state.processing=false;
    $('upload-progress').textContent=errors.length?`Finished with ${errors.length} issue(s). ${errors.slice(0,2).join(' · ')}`:`Added ${list.length} file(s). Review assignments and amounts below.`;
    render();
  }
  async function addFile(file,sourceEmailId=null) {
    const e=ext(file.name), type=(e==='jpeg'?'jpg':e);
    const doc={id:id(),file,name:file.name,extension:type,kind:categoryFor(file.name,type),expenseId:'general',include:true,status:'ready',note:'',hash:null,sourceEmailId,parsedText:'',email:null,pages:null,suggestedAmount:'',suggestedCurrency:'GBP',suggestedDate:'',amountCandidates:[],approvalCandidates:[],hashDuplicate:false};
    state.files.push(doc);
    try{
      doc.hash=await sha256(file);
      const prev=doc.hash && state.files.find(x=>x.id!==doc.id && x.hash===doc.hash);
      if(prev){doc.include=false;doc.hashDuplicate=true;doc.note=`Exact SHA-256 duplicate of ${prev.name}. Excluded unless re-enabled.`;doc.expenseId=prev.expenseId;}
      if(type==='pdf'){
        const out=await readPdfText(file);doc.parsedText=out.text;doc.note ||= out.note;doc.pages=out.pages;
      }else if(type==='eml'||type==='msg'){
        doc.email=await readEmail(file,type);
        doc.parsedText=[doc.email.subject,doc.email.body].join('\n');
        doc.kind=categoryFor(doc.name,type,doc.email.subject+' '+doc.email.body.slice(0,1800));doc.approvalCandidates=Core.excerptApprovals(doc.email.body);
        if(doc.email.attachmentWarning)doc.note='Some embedded attachments could not be read. Please check original MSG.';
      }else{doc.note ||='Image receipt: enter amount and date manually (no automatic OCR).';}
      const inferenceText=(doc.parsedText ? doc.parsedText.slice(0,12000) : '')+'\n'+file.name;
      doc.kind=categoryFor(doc.name,type,doc.parsedText);
      if(doc.email&&doc.approvalCandidates.length)doc.kind='Approval';
      doc.amountCandidates=Core.amountCandidates(doc.parsedText);
      const preferred=doc.amountCandidates.filter(a=>a.confidence==='high').sort((a,b)=>b.value-a.value)[0]
          || doc.amountCandidates.filter(a=>a.confidence==='medium').sort((a,b)=>b.value-a.value)[0];
      doc.suggestedAmount=preferred ? String(preferred.value) : suggestedAmount(doc.parsedText);
      doc.suggestedCurrency=preferred?.currency||Core.currencyFrom(inferenceText,'GBP');
      doc.suggestedDate=Core.dateCandidates(inferenceText)[0]||suggestedDate(inferenceText);
      if(doc.include && ['Receipt','Invoice','Booking / ticket'].includes(doc.kind)){
        const matched=findMatchingExpense(doc);
        const e=matched||makeExpense(file.name.replace(/\.[a-z0-9]+$/i,'').replace(/[_-]+/g,' ').slice(0,70),{amount:doc.suggestedAmount,currency:doc.suggestedCurrency,date:doc.suggestedDate});
        doc.expenseId=e.id;
      }
      if(doc.email && $('extract-attachments').checked){
        for(const att of doc.email.attachments.slice(0,60)){
          if(!ATTACHABLE.has(ext(att.name)))continue;
          try{
            const data=att.content instanceof ArrayBuffer ? att.content : att.content instanceof Uint8Array ? att.content : new Uint8Array(att.content);
            const embeddedFile=new File([data],att.name,{type:att.type||''});
            await addFile(embeddedFile,doc.id);
          }catch(err){doc.note='One email attachment failed to import. Check original email.';}
        }
      }
    }catch(err){doc.status='error';doc.include=false;doc.note=String(err.message||err);}
    return doc;
  }
  function updateExpense(e,key,value){
    e[key]=value;
    if(key!=='verified')e.verified=false;
    if(key==='currency' && value==='GBP' && e.amount && !e.fxRate) e.claimedGBP=e.amount;
    if(key==='amount' && e.currency==='GBP' && !e.fxRate) e.claimedGBP=value;
    if((key==='amount'||key==='fxRate') && e.currency!=='GBP' && number(e.fxRate)>0 && number(e.amount)>0) e.claimedGBP=(number(e.amount)*number(e.fxRate)).toFixed(2);
    render();
  }
  function renderFiles(){
    $('upload-count').textContent=state.files.length ? `${state.files.length} file(s) · ${fileSize(state.files.reduce((s,x)=>s+x.file.size,0))} total`:'No evidence added yet';
    const expOptions=`<option value="general">General approvals / unassigned</option>`+state.expenses.map((e,i)=>`<option value="${e.id}">${String(i+1).padStart(2,'0')} · ${esc(e.title)}</option>`).join('');
    $('file-list').innerHTML=state.files.map(f=>`<div class="file-row" data-id="${f.id}" data-status="${f.status}"><div class="file-avatar" aria-hidden="true">${f.extension==='pdf'?'▤':['eml','msg'].includes(f.extension)?'✉':'▧'}</div><div class="file-meta"><strong title="${esc(f.name)}">${esc(shortName(f.name))}</strong><small>${esc(f.extension.toUpperCase())} · ${fileSize(f.file.size)}${f.pages?` · ${f.pages} page(s)`:''}${f.sourceEmailId?' · from email attachment':''}</small>${f.suggestedAmount?`<small class="file-note">Suggested ${esc(f.suggestedCurrency)} ${esc(f.suggestedAmount)} (verify in original)</small>`:''}${f.note?`<small class="file-note">${esc(f.note)}</small>`:''}<label class="include-control"><input type="checkbox" data-role="include" ${f.include?'checked':''} ${f.status==='error'?'disabled':''}> Include in PDF</label></div><select class="file-category" data-role="kind" aria-label="Evidence type for ${esc(f.name)}">${KINDS.map(k=>`<option ${k===f.kind?'selected':''}>${esc(k)}</option>`).join('')}</select><select class="assign-select" data-role="expense" aria-label="Assign ${esc(f.name)} to expense">${expOptions.replace(`value="${f.expenseId}"`,`value="${f.expenseId}" selected`)}</select><button class="delete-file" data-role="delete" aria-label="Remove ${esc(f.name)}">×</button></div>`).join('');
    $('file-list').querySelectorAll('.file-row').forEach(row=>{
      const f=state.files.find(x=>x.id===row.dataset.id);
      row.querySelector('[data-role="kind"]').addEventListener('change',ev=>{f.kind=ev.target.value;render();});
      row.querySelector('[data-role="include"]').addEventListener('change',ev=>{f.include=ev.target.checked;render();});
      row.querySelector('[data-role="expense"]').addEventListener('change',ev=>{f.expenseId=ev.target.value;render();});
      row.querySelector('[data-role="delete"]').addEventListener('click',()=>{state.files=state.files.filter(x=>x.id!==f.id);render();});
    });
  }
  function renderExpenses(){
    const box=$('expense-list');
    if(!state.expenses.length){box.innerHTML='<div class="empty-ledger">Expense rows appear here when you add receipts, or add one manually to get started.</div>';return;}
    box.innerHTML=state.expenses.map((e,i)=>{
      const assigned=state.files.filter(f=>f.expenseId===e.id&&f.include&&f.status==='ready').length;
      const makeField=(key,label,attrs='')=>`<label><span>${label}</span><input aria-label="${label} for expense ${i+1}" data-field="${key}" value="${esc(e[key])}" ${attrs}></label>`;
      return `<article class="expense-card" data-id="${e.id}"><div class="expense-top"><div><strong>EXPENSE ${String(i+1).padStart(2,'0')}</strong><small> · ${e.suggested?'Suggested fields, please verify':'Manual entry'}</small></div><button type="button" class="delete-expense" data-action="remove" aria-label="Remove expense ${i+1}">×</button></div><div class="expense-fields">${makeField('title','Cost description','maxlength="120"')}${makeField('date','Date','type="date"')}<label><span>Currency</span><select data-field="currency" aria-label="Currency for expense ${i+1}">${CURRENCIES.map(c=>`<option ${e.currency===c?'selected':''}>${c}</option>`).join('')}</select></label>${makeField('amount','Original amount','type="number" min="0" step="0.01" placeholder="0.00"')}</div><div class="expense-fields expense-fields-secondary">${makeField('fxRate','GBP per unit','type="number" step="any" min="0" placeholder="If not GBP"')}${makeField('claimedGBP','GBP claim','type="number" step="0.01" min="0" placeholder="0.00"')}${makeField('rateSource','Rate reference / note','placeholder="Bank rate, card charge, date…" maxlength="160"')}</div><div class="expense-fields expense-fields-secondary">${makeField('note','Reason / explanation','placeholder="Why this cost was necessary" maxlength="350"')}</div><label class="verify-line"><input type="checkbox" data-action="verify" ${e.verified?'checked':''}> I checked this expense is distinct, necessary, and correctly priced</label><div class="expense-evidence"><strong>${assigned}</strong> linked evidence file(s). Assign receipts and approval emails in the upload list above.</div></article>`;
    }).join('');
    box.querySelectorAll('.expense-card').forEach(row=>{
      const e=state.expenses.find(x=>x.id===row.dataset.id);
      row.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',event=>updateExpense(e,event.target.dataset.field,event.target.value)));
      row.querySelector('[data-action="verify"]').addEventListener('change',ev=>{e.verified=ev.target.checked;render();});
      row.querySelector('[data-action="remove"]').addEventListener('click',()=>{
        state.expenses=state.expenses.filter(x=>x.id!==e.id);state.files.filter(x=>x.expenseId===e.id).forEach(f=>f.expenseId='general');render();
      });
    });
  }
  function claimMeta(){return {claimant:$('claimant').value,context:$('claim-context').value,title:$('claim-title').value,ref:$('claim-ref').value,destination:$('destination').value};}
  function getAudit(){return [...Core.audit(state.expenses,state.files,claimMeta()),...state.importWarnings.map(message=>({level:'review',code:'import-rejected',message}))];}
  function renderAudit(){
    const issues=getAudit(),blockers=issues.filter(x=>x.level==='blocker').length,review=issues.filter(x=>x.level==='review').length;
    $('readiness-count').textContent=`${blockers} blocking · ${review} to review · ${issues.filter(x=>x.level==='info').length} informational`;
    $('audit-list').innerHTML=issues.length ? issues.map(x=>`<div class="audit-item ${x.level==='blocker'?'blocker':x.level==='review'?'warn':'info'}"><span aria-hidden="true">${x.level==='blocker'?'⛔':x.level==='review'?'⚑':'ℹ'}</span><span><strong>${esc(x.level.toUpperCase())}</strong> ${esc(x.message)}</span></div>`).join(''):'<div class="audit-item good">✓ No detected outstanding items. A human must still verify the claim and institutional requirements.</div>';
  }
  function renderSuggestions(){
    const host=$('suggestion-list');const links=Core.proposeLinks(state.files,state.expenses);
    const finance=Core.reasonAboutOverlap(state.expenses,state.files).filter(x=>x.level!=='info');
    host.innerHTML=links.map(x=>{const f=state.files.find(d=>d.id===x.fileId),e=state.expenses.find(d=>d.id===x.expenseId);return `<div class="suggestion"><span>${esc(f?.name||'Evidence')} could support <b>${esc(e?.title||'expense')}</b>. ${esc(x.reason)}.</span><button type="button" class="button-outline" data-link="${x.fileId}" data-target="${x.expenseId}">Link evidence</button></div>`;}).join('') + finance.slice(0,6).map(x=>`<div class="suggestion review-note">⚑ ${esc(x.message)}</div>`).join('') || '<p class="soft-note">Suggested evidence-to-expense links will appear here. No costs are automatically merged.</p>';
    host.querySelectorAll('[data-link]').forEach(button=>button.addEventListener('click',()=>{const f=state.files.find(x=>x.id===button.dataset.link);if(f){f.expenseId=button.dataset.target;render();}}));
    const approvals=state.files.filter(f=>f.include&&f.email&&f.approvalCandidates?.length).flatMap(f=>f.approvalCandidates.map((x,i)=>({file:f,suggestion:x,i})));
    const box=$('approval-list');box.innerHTML=approvals.length?approvals.slice(0,15).map(a=>`<div class="suggestion"><span><b>${esc(a.file.name)}</b><small>${esc(a.suggestion.excerpt)}</small><small>Automated candidate, not confirmed approval.</small></span><label class="approve-check"><input type="checkbox" data-file="${a.file.id}" data-index="${a.i}" ${a.suggestion.reviewed?'checked':''}> Reviewed</label></div>`).join(''):'<p class="soft-note">No positive approval wording found. Review the original email threads manually.</p>';
    box.querySelectorAll('[data-file]').forEach(input=>input.addEventListener('change',()=>{const file=state.files.find(f=>f.id===input.dataset.file);if(file?.approvalCandidates?.[Number(input.dataset.index)]){file.approvalCandidates[Number(input.dataset.index)].reviewed=input.checked;renderAudit();}}));
  }
  function render(){
    renderFiles();renderExpenses();
    $('total-claim').textContent=asMoney(state.expenses.reduce((s,e)=>s+number(e.claimedGBP),0));
    renderAudit();renderSuggestions();
    const hasFiles=state.files.some(x=>x.include&&x.status==='ready');
    $('export-btn').disabled=state.exporting||state.processing||!hasFiles||getAudit().some(x=>x.level==='blocker');
    $('draft-btn').disabled=state.exporting||state.processing||!hasFiles;
    if(!state.exporting)setStatus(state.files.length?`${state.files.filter(f=>f.include&&f.status==='ready').length} file(s) · ${getAudit().filter(i=>i.level==='blocker').length} blocker(s) · ${getAudit().filter(i=>i.level==='review').length} to review`:'Add evidence to begin.');
  }

  function claimData(){return {title:$('claim-title').value.trim()||'Reimbursement claim',claimant:$('claimant').value.trim(),ref:$('claim-ref').value.trim(),context:$('claim-context').value.trim(),destination:$('destination').value,total:state.expenses.reduce((n,e)=>n+number(e.claimedGBP),0)};}
  function downloadBlob(blob,name){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async function createPdf(mode='submission'){
    if(state.exporting)return;
    const used=state.files.filter(f=>f.include&&f.status==='ready');
    if(!used.length){setStatus('Upload at least one supported evidence file.',true);return;}
    const issues=getAudit();const blockers=issues.filter(i=>i.level==='blocker');
    if(mode==='submission'&&blockers.length){setStatus(`${blockers.length} blockers must be resolved before the submission-ready PDF can be exported. Download a clearly marked draft instead.`,true);return;}
    if(mode==='submission'&&issues.some(i=>i.level==='review')&&!window.confirm(`There are ${issues.filter(i=>i.level==='review').length} questions to review. Have you checked them against the originals?`))return;
    if(!window.PDFLib?.PDFDocument){setStatus('PDF engine is unavailable. Connect online once, or check cached libraries.',true);return;}
    state.exporting=true;state.lastMode=mode;render();setStatus('Assembling original files and searchable native PDF text...');
    let msg='',failed='';try{
      const fontFile=$('unicode-font').files[0];const fontBytes=fontFile?await fontFile.arrayBuffer():null;
      const result=await Writer.compose({files:state.files,expenses:state.expenses,claim:claimData(),issues,mode:mode==='submission'?'submission':'draft',redact:$('redact-email').checked,fontBytes});
      const name=(claimData().ref||claimData().title||'claim').replace(/[^\w.-]+/g,'_').slice(0,60);
      downloadBlob(result.blob,`${name}_${mode==='draft'?'DRAFT_':''}evidence.pdf`);
      if($('include-manifest').checked)downloadManifest();
      msg=`${mode==='draft'?'DRAFT':'Submission pack'} PDF downloaded · ${result.pages} pages · ${fileSize(result.blob.size)}`;
      if(result.blob.size>20*1024*1024)$('export-hint').textContent='Large PDF: confirm your destination system accepts this file size.';
    }catch(err){failed='PDF generation failed: '+String(err?.message||err);}
    finally{state.exporting=false;render();setStatus(failed||msg,!!failed);}
  }
  function downloadManifest(){const payload=Core.manifest(state.files,state.expenses,claimData(),getAudit());downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),'claimweave_evidence_manifest.json');}
  const {bytesToB64,b64ToBytes}=window.ClaimWeaveCase;
  async function saveEncryptedCase(){
    if(!crypto?.subtle){setStatus('Encrypted case files need HTTPS or localhost, not a plain file:// address.',true);return;}
    const pass=window.prompt('Choose a strong passphrase (12+ characters). It cannot be recovered.');if(pass===null)return;
    if(pass.length<12){setStatus('Please use at least 12 characters for case encryption.',true);return;}
    if(state.files.reduce((n,f)=>n+f.file.size,0)>60*1024*1024&&!confirm('The encrypted working file will be large. Continue?'))return;
    try{
      const packed=[];for(const f of state.files){packed.push({...f,file:{name:f.file.name,type:f.file.type,size:f.file.size,base64:bytesToB64(new Uint8Array(await f.file.arrayBuffer()))}});}
      const payload={schema:'claimweave-encrypted-case-v3',created:new Date().toISOString(),claim:claimData(),expenses:state.expenses,files:packed};
      const wrapper=await window.ClaimWeaveCase.encrypt(payload,pass);
      downloadBlob(new Blob([JSON.stringify(wrapper)],{type:'application/json'}),`claimweave_private_case_${new Date().toISOString().slice(0,10)}.cwc`);
      setStatus('Encrypted working case saved. Keep the passphrase securely; there is no recovery.',false);
    }catch(err){setStatus('Unable to save encrypted case: '+String(err.message||err),true);}
  }
  async function restoreEncryptedCase(file){
    if(!crypto?.subtle){setStatus('Case decryption requires HTTPS or localhost.',true);return;}
    if(!file)return;const pass=window.prompt('Enter the encrypted case passphrase.');if(pass===null)return;
    try{
      const wrapped=JSON.parse(await file.text());
      const obj=await window.ClaimWeaveCase.decrypt(wrapped,pass);
      if(obj.schema!=='claimweave-encrypted-case-v3'||!Array.isArray(obj.files)||!Array.isArray(obj.expenses))throw Error('Invalid case contents.');
      const files=obj.files.map(rec=>({...rec,file:new File([b64ToBytes(rec.file.base64)],rec.file.name,{type:rec.file.type||''})}));
      state.files=files;state.expenses=obj.expenses;state.importWarnings=[];state.sequence=Math.max(state.sequence,...[...files,...obj.expenses].map(v=>Number(String(v.id).slice(1))||0),0);
      for(const [k,v] of Object.entries({'claim-title':obj.claim.title,'claimant':obj.claim.claimant,'claim-ref':obj.claim.ref,'claim-context':obj.claim.context,'destination':obj.claim.destination}))if($(k)&&v!==undefined)$(k).value=v;
      render();setStatus(`Restored ${files.length} evidence file(s) from encrypted case.`);
    }catch(err){setStatus('Case could not be decrypted or validated. Check the passphrase and file.',true);}
  }
  async function runOcr(){
    const images=state.files.filter(f=>f.include&&f.status==='ready'&&(['png','jpg'].includes(f.extension)||(f.extension==='pdf'&&!f.parsedText.trim())));
    if(!images.length){setStatus('Add an image receipt or scanned PDF first.',true);return;}
    if(!confirm('Optional OCR downloads a pinned OCR engine and language data from a third-party CDN. Images are processed in your browser. Continue?'))return;
    const btn=$('ocr-all-btn');btn.disabled=true;setStatus('Preparing browser OCR; this requires a network connection on first use.');
    try{
      if(!window.Tesseract){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(Error('OCR script download failed'));document.head.appendChild(script);});}
      for(let i=0;i<images.length;i++){
        const f=images[i];setStatus(`Reading image ${i+1}/${images.length}: ${f.name}`);
        const lang='eng+chi_sim';let texts=[],confs=[];
        if(f.extension==='pdf'){
          if(!window.pdfjsLib)throw new Error('PDF.js is needed to render scanned PDFs for OCR.');
          const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.file.arrayBuffer())}).promise;
          for(let n=1;n<=Math.min(doc.numPages,2);n++){
            const original=await doc.getPage(n),vp=original.getViewport({scale:1.8});
            const canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;
            await original.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
            const result=await Tesseract.recognize(canvas,lang);
            texts.push(String(result.data?.text||''));confs.push(Number(result.data?.confidence||0));
          }
        }else{const result=await Tesseract.recognize(f.file,lang);texts.push(String(result.data?.text||''));confs.push(Number(result.data?.confidence||0));}
        f.parsedText=texts.join('\n');f.ocrConfidence=confs.reduce((x,y)=>x+y,0)/Math.max(confs.length,1);
        f.amountCandidates=Core.amountCandidates(f.parsedText);
        const preferred=f.amountCandidates.filter(x=>x.confidence==='high').sort((a,b)=>b.value-a.value)[0];
        if(preferred){f.suggestedAmount=String(preferred.value);f.suggestedCurrency=preferred.currency||f.suggestedCurrency;}
        f.note=`OCR suggestion, confidence ${Number(f.ocrConfidence||0).toFixed(0)}%. Verify source before using; first two pages of scanned PDFs only.`;
      }
      render();setStatus(`OCR finished for ${images.length} image(s). Review all extracted figures.`);
    }catch(err){setStatus(`Optional OCR could not complete: ${String(err.message||err)}. Manual entry is still available.`,true);}
    finally{btn.disabled=false;}
  }
  function offlineIndicator(){const v=$('offline-indicator');if(!v)return;v.textContent=navigator.onLine?'Online. Pinned libraries may be cached for later offline use.':'Offline. Export requires previously cached PDF libraries.';}
  function installOfflineShell(){if('serviceWorker'in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});window.addEventListener('online',offlineIndicator);window.addEventListener('offline',offlineIndicator);offlineIndicator();}
  function bind(){
    const zone=$('dropzone'),input=$('file-input');
    zone.addEventListener('click',()=>input.click());zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
    input.addEventListener('change',async()=>{await addFiles(input.files);input.value='';});
    for(const name of ['dragenter','dragover'])zone.addEventListener(name,e=>{e.preventDefault();zone.classList.add('dragover');});
    for(const name of ['dragleave','drop'])zone.addEventListener(name,e=>{e.preventDefault();zone.classList.remove('dragover');});
    zone.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files);});
    $('add-expense').addEventListener('click',()=>{makeExpense();render();});
    $('reset-btn').addEventListener('click',()=>{if(window.confirm('Clear all in-memory documents, expenses and claim details? Remember to save an encrypted case first.')){state.files=[];state.expenses=[];state.importWarnings=[];['claimant','claim-ref','claim-context'].forEach(k=>$(k).value='');render();}});
    $('export-btn').addEventListener('click',()=>createPdf('submission'));
    $('draft-btn').addEventListener('click',()=>createPdf('draft'));
    $('manifest-btn').addEventListener('click',downloadManifest);
    $('ocr-all-btn').addEventListener('click',runOcr);
    $('save-case-btn').addEventListener('click',saveEncryptedCase);
    $('restore-case-btn').addEventListener('click',()=>$('restore-case-file').click());
    $('restore-case-file').addEventListener('change',async e=>{const file=e.target.files[0];if(file)await restoreEncryptedCase(file);e.target.value='';});
    $('paste-email-btn').addEventListener('click',()=>$('paste-email-dialog').showModal());
    $('close-paste').addEventListener('click',()=>$('paste-email-dialog').close());
    $('save-paste').addEventListener('click',()=>{
      const subject=$('paste-subject').value.trim(),body=$('paste-body').value.trim();
      if(!subject||!body){window.alert('Please add both the email subject and message text.');return;}
      const info={subject,body,from:$('paste-from').value.trim(),to:$('paste-to').value.trim(),date:$('paste-date').value.trim(),cc:'',attachments:[]};
      const source=['Subject: '+subject,'From: '+info.from,'To: '+info.to,'Date: '+info.date,'','MANUALLY COPIED EMAIL - CHECK ORIGINAL','',body].join('\n');
      const safeName=subject.replace(/[^a-z0-9 ._-]/gi,'').replace(/\s+/g,'_').slice(0,55)||'email';
      const file=new File([source],`Copied_${safeName}.eml`,{type:'message/rfc822'});
      const doc={id:id(),file,name:file.name,extension:'eml',kind:/approv|authoris|authoriz|consent|permission/i.test(subject+' '+body.slice(0,200))?'Approval':'Correspondence',expenseId:'general',include:true,status:'ready',note:'Manual copy: verify against original email.',hash:null,sourceEmailId:null,parsedText:source,email:info,pages:null,suggestedAmount:'',suggestedCurrency:'GBP',suggestedDate:'',manualPaste:true};
      doc.approvalCandidates=Core.excerptApprovals(info.body);doc.amountCandidates=Core.amountCandidates(info.body);state.files.push(doc);$('paste-email-dialog').close();
      for(const field of ['paste-subject','paste-body','paste-from','paste-to','paste-date'])$(field).value='';
      render();
    });
    $('how-btn').addEventListener('click',()=>$('help-dialog').showModal());
    $('close-help').addEventListener('click',()=>$('help-dialog').close());
    $('close-help-bottom').addEventListener('click',()=>$('help-dialog').close());
  }
  bind();render();installOfflineShell();
  // No application storage is used; this object is exposed solely for local QA tests.
  window.__claimWeaveDiagnostics = {counts:()=>({files:state.files.length,expenses:state.expenses.length,issues:getAudit().length,blockers:getAudit().filter(i=>i.level==='blocker').length}),currency:inferCurrency,amount:suggestedAmount,audit:getAudit,core:Core,addFiles,createPdf,saveEncryptedCase,state};
})();
