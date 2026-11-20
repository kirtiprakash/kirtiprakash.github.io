/* ClaimWeave redaction leads. Deterministic, local, approval-only.
   Coordinates are normalized to the page viewport (top-left origin).
   No suggestion changes exported PDFs unless a user applies it. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.ClaimWeaveRedactionSuggestions=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 const money=x=>Number(String(x??'').replace(/[,£€¥₹\s]/g,''));
 function normalizeLine(text){return String(text||'').replace(/\s+/g,' ').trim();}
 function normalizedBox(rect,width,height,pad=0){
  const x1=clamp((Math.min(rect.x1,rect.x2)-pad)/width),y1=clamp((Math.min(rect.y1,rect.y2)-pad)/height);
  const x2=clamp((Math.max(rect.x1,rect.x2)+pad)/width),y2=clamp((Math.max(rect.y1,rect.y2)+pad)/height);
  return {x:x1,y:y1,w:Math.max(0,x2-x1),h:Math.max(0,y2-y1)};
 }
 function linesFromPdf(items,viewport){
  const lines=[];const util=globalThis.pdfjsLib?.Util;
  for(const item of items||[]){
   if(!item.str?.trim()||!Array.isArray(item.transform))continue;
   const tx=util?util.transform(viewport.transform,item.transform):null;
   if(!tx)continue;
   const size=Math.max(7,Math.min(32,Math.hypot(tx[2],tx[3])||Number(item.height)||10));
   const width=Math.max(1,(Number(item.width)||item.str.length*size*.5)*Math.hypot(viewport.transform[0],viewport.transform[1]));
   const x=tx[4],baseline=tx[5],y=baseline-size*1.15;
   if(!Number.isFinite(x)||!Number.isFinite(y))continue;
   const itemBox={x1:Math.max(0,x),y1:Math.max(0,y),x2:Math.min(viewport.width,x+width),y2:Math.min(viewport.height,y+size*1.7)};
   let line=lines.find(l=>Math.abs(l.baseline-baseline)<=Math.max(3,size*.45));
   if(!line){line={baseline,text:'',parts:[],box:{...itemBox}};lines.push(line);}
   line.parts.push({text:item.str,x,box:itemBox});
   line.box.x1=Math.min(line.box.x1,itemBox.x1);line.box.y1=Math.min(line.box.y1,itemBox.y1);
   line.box.x2=Math.max(line.box.x2,itemBox.x2);line.box.y2=Math.max(line.box.y2,itemBox.y2);
  }
  lines.forEach(l=>{l.parts.sort((a,b)=>a.x-b.x);l.text=normalizeLine(l.parts.map(p=>p.text).join(' '));});
  return lines.sort((a,b)=>a.box.y1-b.box.y1||a.box.x1-b.box.x1);
 }
 const bankSensitive=[
  {type:'Account details',re:/\b(?:account\s*(?:number|no\.?|#)|a\/c\s*(?:no\.?|number)|sort\s*code|routing\s*(?:number|no\.?|#)|iban|swift\s*\/\s*bic|bic\s*code|customer\s*(?:id|number)|card\s*(?:number|no\.?|#)|ifsc)\s*[:#-]?\s*[\w*\s-]{4,45}/i},
  {type:'Contact details',re:/\b(?:e-?mail|phone|mobile|telephone|contact\s*(?:number|no\.?))\s*[:#-]?\s*\S.{3,75}/i},
  {type:'Postal address',re:/\b(?:registered\s*address|mailing\s*address|residential\s*address|billing\s*address|address\s*:)\s*\S.{3,100}/i},
  {type:'Account balance',re:/\b(?:opening\s*balance|closing\s*balance|available\s*balance|account\s*balance|balance\s*brought\s*forward|balance\s*carried\s*forward)\b/i},
  {type:'Account details',re:/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i},
  {type:'Contact details',re:/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i}
 ];
 const transactionDate=/\b(?:\d{1,2}[-/.]\d{1,2}(?:[-/.]\d{2,4})?|20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/;
 const valuePattern=/(?:£|\$|€|¥|₹|\b(?:GBP|CNY|RMB|INR|USD|EUR)\b)\s*[-+]?\s*\d[\d,]*(?:\.\d{2})?|[-+]?\b\d{1,7}[,.]\d{2}\b/gi;
 function isClaimLine(text,claims){
  const nums=[...text.matchAll(valuePattern)].map(x=>money(x[0])).filter(Number.isFinite);
  return claims.some(e=>{
   const value=money(e.amount),gbp=money(e.claimedGBP);
   if(!(value>0||gbp>0))return false;
   return nums.some(n=>(value>0&&Math.abs(n-value)<.011)||(gbp>0&&Math.abs(n-gbp)<.011));
  });
 }
 function propose({items,viewport,expenses=[],page=1}){
  const lines=linesFromPdf(items,viewport);const proposals=[];let serial=0;
  const push=(line,type,reason,pad=3)=>{
   if(!line.box||!line.text)return;
   const rect=normalizedBox(line.box,viewport.width,viewport.height,pad);
   if(rect.w<.003||rect.h<.002)return;
   if(proposals.some(p=>Math.abs(p.rect.y-rect.y)<.005&&p.type===type))return;
   proposals.push({id:'p'+page+'-'+(++serial),page,type,reason,preview:line.text.slice(0,110),rect,selected:false});
  };
  for(let i=0;i<lines.length;i++){
   const l=lines[i],txt=l.text;
   const sensitive=bankSensitive.find(p=>p.re.test(txt));
   if(sensitive){push(l,sensitive.type,'Review this field for personal or financial information.');continue;}
   // Transaction detection is conservative. A dated row with a money amount
   // qualifies as a candidate, never an automatic deletion. Rows with a matched
   // claim amount are left visible; users may still cover them manually.
   const amounts=[...txt.matchAll(valuePattern)];
   if(transactionDate.test(txt)&&amounts.length&&!isClaimLine(txt,expenses)){
    push(l,'Possibly unrelated transaction','No matching claim amount was detected on this line. Check before applying.',3);
   }
  }
  return proposals.slice(0,180);
 }
 return {propose,linesFromPdf,normalizedBox,isClaimLine};
});