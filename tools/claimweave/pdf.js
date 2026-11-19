/* ClaimWeave PDF composer. Native PDF text for Latin-script content. Original
   PDFs are copied byte-for-byte at the page-content level via pdf-lib; original
   images are embedded directly. Non-Latin lines without a user-supplied font
   are rendered locally as images instead of substituting incorrect glyphs. */
(function(root,factory){const result=factory();if(typeof module==='object'&&module.exports)module.exports=result;root.ClaimWeavePdf=result;})(globalThis,function(){
'use strict';
const W=595,H=842,LEFT=48,RIGHT=547,TOP=H-48,CONTENT_BOTTOM=48;
const CYAN=[0.15,.40,.42], INK=[.12,.24,.30], MUTE=[.42,.49,.50], GOLD=[.69,.50,.27], PALE=[.94,.97,.95];
let pdf,regular,bold,serif,unicode,settings,cache;
function rgb(color){return window.PDFLib.rgb(...color);}
function ascii(t){return String(t??'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2012-\u2015]/g,'-').replace(/\u2022/g,'*').replace(/\u2192/g,'>').replace(/\u00a0/g,' ');}
function fontFor(t,size=10,heavy=false){const str=ascii(t);if(unicode){try{unicode.encodeText(str);return unicode;}catch(e){/* not covered */}} const base=heavy?bold:regular;try{base.encodeText(str);return base;}catch(e){return null;}}
async function drawLine(page,t,x,y,size=10,weight=false,color=INK,maxWidth=RIGHT-x){
 const line=ascii(t);const font=fontFor(line,size,weight);
 if(font){page.drawText(line,{x,y,font,size,color:rgb(color),maxWidth});return;}
 // Render only unsupported glyph-bearing lines as small transparent PNGs.
 const canvas=document.createElement('canvas'),scale=2.3;
 const ctx=canvas.getContext('2d');ctx.font=`${weight?'700 ':'400 '}${size*scale}px Arial, 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif`;
 canvas.width=Math.min(3200,Math.max(32,Math.ceil(ctx.measureText(line).width+6)));canvas.height=Math.ceil(size*scale*1.65);
 ctx.font=`${weight?'700 ':'400 '}${size*scale}px Arial, 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif`;
 ctx.fillStyle=`rgb(${color.map(z=>Math.round(z*255)).join(',')})`;ctx.textBaseline='alphabetic';ctx.fillText(line,2,size*scale*1.20);
 const data=canvas.toDataURL('image/png');let image=cache.get(data);if(!image){image=await pdf.embedPng(data);cache.set(data,image);}
 const width=Math.min(maxWidth,canvas.width/scale);
 page.drawImage(image,{x,y:y-3,width,height:canvas.height/scale});
}
function width(t,font,size){try{return font.widthOfTextAtSize(ascii(t),size);}catch(e){return String(t).length*size*.53;}}
function wrap(t,maxWidth=495,size=10,font=regular){
 const out=[];for(const paragraph of String(t??'').replace(/\r/g,'').split('\n')){
  if(!paragraph.trim()){out.push('');continue;}
  let acc='';const parts=paragraph.split(/(\s+)/).filter(Boolean);
  for(let word of parts){
   while(word&&width(word,font,size)>maxWidth){const chars=[...word];let cut=1;while(cut<chars.length&&width(chars.slice(0,cut+1).join(''),font,size)<maxWidth)cut++;
    if(acc.trim()){out.push(acc.trim());acc='';}out.push(chars.slice(0,cut).join(''));word=chars.slice(cut).join('');
   }
   if(!word)continue;
   if(width(acc+word,font,size)<=maxWidth)acc+=word;
   else {if(acc.trim())out.push(acc.trim());acc=word.trimStart();}
  }
  if(acc.trim())out.push(acc.trim());
 }
 return out;
}
function newPage(section='EVIDENCE'){
 const page=pdf.addPage([W,H]);page.drawRectangle({x:0,y:H-7,width:W,height:7,color:rgb(CYAN)});
 page.drawText('CLAIMWEAVE  /  '+section,{x:LEFT,y:TOP,font:bold,size:8,color:rgb(CYAN)});
 return page;
}
function footer(page,pageNo,mode){
 page.drawLine({start:{x:LEFT,y:38},end:{x:RIGHT,y:38},thickness:.5,color:rgb([.77,.82,.81])});
 page.drawText(`Page ${pageNo}  |  ${mode==='draft'?'DRAFT - NOT READY FOR SUBMISSION':'USER-REVIEWED EVIDENCE'}`,{x:LEFT,y:24,font:regular,size:7,color:rgb(MUTE)});
}
async function heading(page,title,y,subtitle){await drawLine(page,title,LEFT,y,22,true,INK);y-=31;
 if(subtitle){for(const line of wrap(subtitle,490,10,regular)){await drawLine(page,line,LEFT,y,10,false,MUTE);y-=14;}}return y-10;}
async function details(page,rows,y){for(const [label,val] of rows){if(val===undefined||val===null||String(val).trim()==='')continue;
  await drawLine(page,label.toUpperCase(),LEFT,y,7.5,true,CYAN);y-=16;
  for(const line of wrap(String(val),490,10,regular)){await drawLine(page,line,LEFT,y,10,false,INK);y-=13;}
  y-=9;
 }return y;}
function currencyAmount(e){return `${e.currency||'GBP'} ${(e.amount===''||e.amount===undefined?'(not entered)':e.amount)}  /  GBP ${(e.claimedGBP===''||e.claimedGBP===undefined?'(not entered)':e.claimedGBP)}`;}
function sortEvidence(group){const priority={'Approval':0,'Invoice':1,'Receipt':2,'Statement':3,'Booking / ticket':4,'Exchange rate':5,'Correspondence':6,'Other':7};return [...group].sort((a,b)=>(priority[a.kind]??10)-(priority[b.kind]??10));}
async function compose({files,expenses,claim,issues,mode='draft',redact=false,fontBytes=null}){
 const lib=window.PDFLib;if(!lib?.PDFDocument)throw new Error('PDF engine missing. Open the site online first to load the pinned PDF library.');
 pdf=await lib.PDFDocument.create();regular=await pdf.embedFont(lib.StandardFonts.Helvetica);bold=await pdf.embedFont(lib.StandardFonts.HelveticaBold);serif=await pdf.embedFont(lib.StandardFonts.TimesRoman);unicode=null;cache=new Map();settings={redact,mode};
 if(fontBytes){if(!window.fontkit)throw new Error('Unicode font support not loaded. Reconnect once and reload this page.');pdf.registerFontkit(window.fontkit);unicode=await pdf.embedFont(new Uint8Array(fontBytes),{subset:true});}
 pdf.setTitle(`${mode==='draft'?'DRAFT - ':''}Expense evidence | ${claim.title}`);
 pdf.setSubject('Locally composed, source-aware ClaimWeave v3.0 evidence dossier');
 pdf.setCreator('ClaimWeave v3.0 (browser-only)');
 const used=files.filter(f=>f.include&&f.status==='ready');const groups=expenses.map(e=>({e,docs:sortEvidence(used.filter(f=>f.expenseId===e.id))}));
 const generalDocs=sortEvidence(used.filter(f=>f.expenseId==='general'||!expenses.some(e=>e.id===f.expenseId)));
 const cover=newPage('CLAIM OVERVIEW');
 const coverExtra=Math.max(0,Math.ceil((groups.length-5)/19));
 const indexExtras=Array.from({length:coverExtra},()=>newPage('CONTINUED INDEX'));
 const ISSUES_PER_PAGE=8;
 const issuePages=issues.length?Array.from({length:Math.ceil(issues.length/ISSUES_PER_PAGE)},()=>newPage('REVIEW RECORD')):[];
 const toc=[];
 for(const [i,g] of groups.entries()){
  const start=pdf.getPageCount()+1;
  if(!g.docs.length)continue;
  // No blank divider page: directly prepend a minimal heading to image and text evidence.
  for(const doc of g.docs)await appendDocument(doc,`${i+1}. ${g.e.title}`,fontBytes);
  toc.push({i,e:g.e,start,end:pdf.getPageCount(),files:g.docs.length});
 }
 let general=null;if(generalDocs.length){const start=pdf.getPageCount()+1;for(const d of generalDocs)await appendDocument(d,'GENERAL CORRESPONDENCE',fontBytes);general={start,end:pdf.getPageCount(),count:generalDocs.length};}
 await coverSheet(cover,{groups,toc,claim,issues,mode,general,used});
 addBookmarks([{title:'Claim overview',page:1},...toc.map(r=>({title:`${r.i+1}. ${r.e.title}`,page:r.start})),...(general?[{title:'General correspondence',page:general.start}]:[]),...(issuePages.length?[{title:'Review register',page:1+indexExtras.length}]:[])]);
 for(let i=0;i<indexExtras.length;i++)await continuedIndex(indexExtras[i],toc.slice(5+i*19,5+(i+1)*19),general);
 for(let i=0;i<issuePages.length;i++)await issueSheet(issuePages[i],issues.slice(i*ISSUES_PER_PAGE,(i+1)*ISSUES_PER_PAGE),i,mode);
 const pages=pdf.getPages();for(let i=0;i<pages.length;i++){const isOriginal=pages[i].__claimweaveOriginal; if(!isOriginal)footer(pages[i],i+1,mode);}
 const blob=new Blob([await pdf.save({useObjectStreams:true})],{type:'application/pdf'});
 return {blob,pages:pdf.getPageCount(),nativeSearchable:true,unicodeFont:!!unicode};
}
function addBookmarks(items){
 try{
  const {PDFName,PDFNumber,PDFHexString,PDFString}=window.PDFLib;
  const context=pdf.context;
  if(!context||!PDFName||!PDFNumber||!items.length)return false;
  const refs=items.map(()=>context.register(context.obj({})));
  const outline=context.obj({Type:PDFName.of('Outlines'),First:refs[0],Last:refs[refs.length-1],Count:PDFNumber.of(refs.length)});
  const treeRef=context.register(outline);
  items.forEach((item,i)=>{
   const node=context.lookup(refs[i]);
   const title=String(item.title||'Evidence').slice(0,150);
   node.set(PDFName.of('Title'),PDFHexString?.fromText?PDFHexString.fromText(title):PDFString.of(ascii(title)));
   node.set(PDFName.of('Parent'),treeRef);
   if(i)node.set(PDFName.of('Prev'),refs[i-1]);
   if(i<refs.length-1)node.set(PDFName.of('Next'),refs[i+1]);
   node.set(PDFName.of('Dest'),context.obj([pdf.getPage(item.page-1).ref,PDFName.of('Fit')]));
  });
  pdf.catalog.set(PDFName.of('Outlines'),treeRef);
  return true;
 }catch(e){return false;}// A failed outline must not damage the underlying evidence pack.
}
async function coverSheet(page,{groups,toc,claim,issues,mode,general,used}){
 if(mode==='draft'){
  page.drawRectangle({x:LEFT,y:697,width:RIGHT-LEFT,height:25,color:rgb([.99,.89,.83])});
  await drawLine(page,'DRAFT - NOT READY FOR SUBMISSION',LEFT+9,705,12,true,[.63,.25,.13]);
 }
 let y=mode==='draft'?670:699;
 y=await heading(page,'Reimbursement evidence',y,claim.title||'Expense supporting documents');
 page.drawRectangle({x:LEFT,y:y-47,width:RIGHT-LEFT,height:64,color:rgb(PALE)});
 await drawLine(page,`GBP ${Number(claim.total||0).toFixed(2)}`,LEFT+13,y-10,25,true,CYAN);
 await drawLine(page,`${groups.length} expense line(s)  |  ${used.length} included document(s)`,LEFT+14,y-29,9,false,MUTE);y-=87;
 const meta=[['Claimant',claim.claimant||'Not supplied'],['Reference',claim.ref||'Not supplied'],['Prepared for',claim.destination||'Expenses portal'],['Purpose',claim.context||'Not supplied']];
 for(const [k,v] of meta){await drawLine(page,`${k}:`,LEFT,y,9,true,INK);const lines=wrap(v,390,9,regular).slice(0,2);let dy=y;for(const line of lines){await drawLine(page,line,LEFT+102,dy,9,false,INK);dy-=12;}y-=Math.max(22,lines.length*12+4);}
 y-=9;await drawLine(page,'EVIDENCE INDEX',LEFT,y,10,true,CYAN);y-=19;
 if(!toc.length){await drawLine(page,'No linked evidence entries',LEFT,y,9,false,MUTE);y-=16;}
 for(const r of toc.slice(0,5)){
  await drawLine(page,`${r.i+1}. ${r.e.title.slice(0,46)}`,LEFT,y,9,true,INK);
  await drawLine(page,`p. ${r.start}${r.start!==r.end?`-${r.end}`:''}`,RIGHT-75,y,9,false,CYAN);y-=13;
  await drawLine(page,currencyAmount(r.e).slice(0,80),LEFT+12,y,8,false,MUTE);y-=23;
 }
 if(toc.length>5){await drawLine(page,`+ ${toc.length-5} further item(s) in continued index`,LEFT,y,9,false,CYAN);y-=19;}
 if(general){await drawLine(page,`General supporting correspondence | p. ${general.start}-${general.end}`,LEFT,y,8,false,CYAN);y-=22;}
 if(issues.length){y-=5;await drawLine(page,`${issues.length} REVIEW ITEM(S): ${issues.filter(i=>i.level==='blocker').length} blockers`,LEFT,Math.max(y,111),10,true,[.67,.31,.12]);
  await drawLine(page,'See complete review record on following page(s).',LEFT,Math.max(y-15,95),8,false,MUTE);
 }
 await drawLine(page,'Source files are preserved as uploaded where technically possible.',LEFT,69,8,false,MUTE);
}
async function continuedIndex(page,toc,general){let y=await heading(page,'Evidence index',H-97,'Detailed expense-to-evidence page references');for(const r of toc){
 await drawLine(page,`${r.i+1}. ${r.e.title}`,LEFT,y,10,true,INK);await drawLine(page,`p. ${r.start}-${r.end}`,RIGHT-82,y,9,false,CYAN);y-=17;
 await drawLine(page,currencyAmount(r.e),LEFT+8,y,9,false,MUTE);y-=28;
 }if(general){await drawLine(page,`General approvals | p. ${general.start}-${general.end}`,LEFT,y-11,9,true,CYAN);}}
async function issueSheet(page,list,index,mode){let y=await heading(page,'Outstanding review items',H-97,'Complete report: warnings are never silently removed from a draft');for(const item of list){
 const label=`${item.level.toUpperCase()}  /  ${item.code}`;await drawLine(page,label,LEFT,y,8,true,item.level==='blocker'?[.7,.25,.15]:CYAN);y-=16;
 for(const line of wrap(item.message,495,9,regular)){await drawLine(page,line,LEFT,y,9,false,INK);y-=13;}y-=10;
 }}
async function appendDocument(doc,section,fontBytes){
 if(doc.extension==='pdf'){
  const bytes=await doc.file.arrayBuffer();let orig;try{orig=await window.PDFLib.PDFDocument.load(bytes);}catch(e){throw new Error(`Cannot open original PDF: ${doc.name}. Please re-save as unencrypted PDF and retry.`);}
  const pages=await pdf.copyPages(orig,orig.getPageIndices());for(const p of pages){p.__claimweaveOriginal=true;pdf.addPage(p);}return;
 }
 if(doc.extension==='png'||doc.extension==='jpg'||doc.extension==='jpeg'){
  const fileBytes=await doc.file.arrayBuffer();const image=doc.extension==='png'?await pdf.embedPng(fileBytes):await pdf.embedJpg(fileBytes);
  const page=newPage('ORIGINAL RECEIPT');await drawLine(page,`${section}  /  ${doc.kind}`,LEFT,TOP-43,11,true,CYAN);
  const {width,height}=image.scaleToFit(W-2*LEFT,H-180);
  page.drawImage(image,{x:(W-width)/2,y:102+(H-235-height)/2,width,height});
  await drawLine(page,doc.name,LEFT,68,8,false,MUTE);return;
 }
 if(doc.email){await emailPages(doc,section);return;}
 throw new Error(`Unsupported evidence file: ${doc.name}`);
}
async function emailPages(doc,section){
 const email=doc.email||{},head=[['From',email.from],['To',email.to],['Cc',email.cc],['Sent',email.date],['Original file',doc.name]];
 let page=newPage('OUTLOOK CORRESPONDENCE'),y=TOP-40;
 y=await heading(page,'Email correspondence',y,`Source: ${section}`);
 const subject=settings.redact?window.ClaimWeaveCore.incidentalRedact(email.subject||doc.name):email.subject||doc.name;
 for(const line of wrap(subject,480,12,bold)){await drawLine(page,line,LEFT,y,12,true,INK);y-=16;}y-=6;
 for(const [k,v] of head){if(!v)continue;const val=settings.redact ? window.ClaimWeaveCore.incidentalRedact(v):v;
  await drawLine(page,`${k}:`,LEFT,y,8,true,CYAN);for(const line of wrap(String(val),414,9,regular)){await drawLine(page,line,LEFT+73,y,9,false,INK);y-=12;}y-=3;
 }
 const reviewed=(doc.approvalCandidates||[]).filter(c=>c.reviewed).slice(0,2);
 if(reviewed.length){
  y-=9;await drawLine(page,'USER-REVIEWED APPROVAL CANDIDATE (CHECK ORIGINAL)',LEFT,y,8,true,CYAN);y-=16;
  for(const c of reviewed){const quote=settings.redact?window.ClaimWeaveCore.incidentalRedact(c.excerpt):c.excerpt;
   for(const line of wrap(quote,475,9,regular).slice(0,3)){await drawLine(page,line,LEFT,y,9,false,INK);y-=12;}
  }y-=8;
 }
 y-=10;page.drawLine({start:{x:LEFT,y},end:{x:RIGHT,y},thickness:.7,color:rgb([.78,.84,.83])});y-=23;
 let body=String(email.body||'(No readable email body. Check the original.)');if(settings.redact)body=window.ClaimWeaveCore.incidentalRedact(body);
 let lines=wrap(body,W-2*LEFT,9,unicode||regular),max=4200;if(lines.length>max)lines=lines.slice(0,max).concat(['[Long email truncated; consult original source]']);
 for(const line of lines){if(y<CONTENT_BOTTOM+18){page=newPage('CORRESPONDENCE CONTINUED');y=TOP-43;}
  if(line)await drawLine(page,line,LEFT,y,9,false,INK);y-=12;
 }
 if((email.attachments||[]).length){if(y<CONTENT_BOTTOM+75){page=newPage('EMAIL ATTACHMENTS');y=TOP-48;}y-=12;
  await drawLine(page,'ATTACHMENTS REFERENCED IN ORIGINAL MESSAGE',LEFT,y,9,true,CYAN);y-=16;
  for(const a of email.attachments){if(y<CONTENT_BOTTOM+20){page=newPage('ATTACHMENTS CONTINUED');y=TOP-45;}await drawLine(page,a.name.slice(0,90),LEFT,y,8,false,MUTE);y-=12;}
 }
}
return {compose,ascii,wrap,sortEvidence};
});
