var QRCODE=(function(){
var GF_EXP=new Array(512),GF_LOG=new Array(256);
(function(){var x=1;for(var i=0;i<255;i++){GF_EXP[i]=x;GF_LOG[x]=i;x=x<<1;if(x&256)x^=285;}
for(var i=255;i<512;i++)GF_EXP[i]=GF_EXP[i-255];}());
function gf_mul(x,y){if(x==0||y==0)return 0;return GF_EXP[GF_LOG[x]+GF_LOG[y]];}
function gf_poly_mul(p,q){var r=[];for(var k=0;k<p.length+q.length-1;k++)r.push(0);
for(var j=0;j<q.length;j++)for(var i=0;i<p.length;i++)r[i+j]^=gf_mul(p[i],q[j]);return r;}
function rs_generator(n){var g=[1];for(var i=0;i<n;i++)g=gf_poly_mul(g,[1,GF_EXP[i]]);return g;}
function rs_encode(msg,n){var g=rs_generator(n);var lm=msg.slice();
for(var i=0;i<n;i++)lm.push(0);
for(var i=0;i<msg.length;i++){var c=lm[i];if(c!=0)for(var j=0;j<g.length;j++)lm[i+j]^=gf_mul(g[j],c);}
return lm.slice(msg.length);}
var NDATA=16,NEC=10,SIZE=25;

function encode(text){
  var bytes=[];for(var i=0;i<text.length;i++)bytes.push(text.charCodeAt(i)&0xFF);
  if(bytes.length>NDATA-3)bytes=bytes.slice(0,NDATA-3);
  var bits=[];
  function addBits(v,n){for(var i=n-1;i>=0;i--)bits.push((v>>i)&1);}
  addBits(4,4);addBits(bytes.length,8);
  for(var i=0;i<bytes.length;i++)addBits(bytes[i],8);
  addBits(0,4);
  while(bits.length%8)bits.push(0);
  var cw=[];
  for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=(b<<1)|bits[i+j];cw.push(b);}
  var pad=[236,17];while(cw.length<NDATA)cw.push(pad[(cw.length-Math.ceil(bits.length/8))%2]);
  return cw.concat(rs_encode(cw,NEC));
}

function makeMatrix(text){
  var m=[];
  for(var i=0;i<SIZE;i++){m.push([]);for(var j=0;j<SIZE;j++)m[i].push(null);}
  
  function setFinder(row,col){
    for(var dr=-1;dr<=7;dr++){
      for(var dc=-1;dc<=7;dc++){
        var r=row+dr,c=col+dc;
        if(r<0||r>=SIZE||c<0||c>=SIZE)continue;
        var inOuter=dr>=0&&dr<=6&&dc>=0&&dc<=6;
        var inInner=dr>=1&&dr<=5&&dc>=1&&dc<=5;
        var inCore=dr>=2&&dr<=4&&dc>=2&&dc<=4;
        m[r][c]=(inOuter&&(!inInner||inCore));
      }
    }
  }
  
  setFinder(0,0);
  setFinder(0,SIZE-7);
  setFinder(SIZE-7,0);
  
  // Timing patterns
  for(var i=8;i<SIZE-8;i++){
    if(m[6][i]===null)m[6][i]=(i%2==0);
    if(m[i][6]===null)m[i][6]=(i%2==0);
  }
  
  // Dark module
  m[SIZE-8][8]=true;
  
  // Format info for ECC=M(bits 10), mask=2 (bits 010)
  // Format: 10 010 -> error+mask bits = 10010
  // Before masking BCH: compute BCH for 10010
  // Format string for Level M, Mask 2 = 110011000101111 (from QR spec table)
  var fb=[1,1,0,0,1,1,0,0,0,1,0,1,1,1,1];
  // Top-left format positions
  var fp1=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  for(var i=0;i<15;i++)m[fp1[i][0]][fp1[i][1]]=!!fb[i];
  // Top-right and bottom-left copies
  var fp2r=[[SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8]];
  var fp2c=[[8,SIZE-8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2],[8,SIZE-1]];
  // Bottom-left (7 bits, reversed)
  for(var i=0;i<7;i++)m[fp2r[i][0]][fp2r[i][1]]=!!fb[14-i];
  // Top-right (8 bits)
  for(var i=0;i<8;i++)m[fp2c[i][0]][fp2c[i][1]]=!!fb[7+i];
  
  // Place data codewords
  var cw=encode(text),bits=[],b;
  for(var i=0;i<cw.length;i++)for(var j=7;j>=0;j--)bits.push((cw[i]>>j)&1);
  
  var bitIdx=0,upward=true,col=SIZE-1;
  while(col>0){
    if(col===6)col--;
    for(var i=0;i<SIZE;i++){
      var row=upward?(SIZE-1-i):i;
      for(var dc=0;dc<2;dc++){
        var c=col-dc;
        if(m[row][c]===null){
          b=bitIdx<bits.length?bits[bitIdx++]:0;
          if((row+c)%2===0)b^=1; // mask 2
          m[row][c]=!!b;
        }
      }
    }
    upward=!upward;col-=2;
  }
  return m;
}

function draw(text,container,size){
  size=size||120;
  var m=makeMatrix(text),n=m.length,quiet=4;
  var cell=Math.floor(size/(n+2*quiet));
  var w=(n+2*quiet)*cell;
  var cv=document.createElement('canvas');
  cv.width=cv.height=w;cv.style.borderRadius='6px';
  var ctx=cv.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,w,w);
  ctx.fillStyle='#1a3a5c';
  for(var r=0;r<n;r++)for(var c=0;c<n;c++)
    if(m[r][c])ctx.fillRect((c+quiet)*cell,(r+quiet)*cell,cell,cell);
  container.appendChild(cv);
}
return{draw:draw};
})();



var API_KEY_STORAGE = 'patient-xx-api-key';
function saveApiKey(v){ try{ if(v){ localStorage.setItem(API_KEY_STORAGE,v); sessionStorage.setItem(API_KEY_STORAGE,v); } }catch(e){} }
function loadApiKey(){ try{ return localStorage.getItem(API_KEY_STORAGE)||sessionStorage.getItem(API_KEY_STORAGE)||''; }catch(e){ return ''; } }
function sq(q){document.getElementById('aiQ').value=q;document.getElementById('aiQ').focus()}
window.addEventListener('DOMContentLoaded',function(){
  var cu=document.getElementById('currentUrl');
  if(cu) cu.textContent=window.location.href;
  var ta=document.getElementById('aiQ');
  if(ta)ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.ctrlKey)askC()});
  var toggle=document.getElementById('apiKeyToggle');
  var apiInput=document.getElementById('apiKey');
  if(apiInput){
    var saved=loadApiKey(); if(saved){ apiInput.value=saved; var st=document.getElementById('apiKeyStatus'); if(st)st.textContent='Key restored from storage'; }
    apiInput.addEventListener('input',function(){ saveApiKey(apiInput.value.trim()); });
    apiInput.addEventListener('blur',function(){ saveApiKey(apiInput.value.trim()); });
  }
  var saveBtn=document.getElementById('apiKeySave');
  if(saveBtn&&apiInput){ saveBtn.addEventListener('click',function(){ var v=apiInput.value.trim(); saveApiKey(v); var st=document.getElementById('apiKeyStatus'); if(st)st.textContent=v?'Key saved.':'Enter a key first.'; setTimeout(function(){ if(st)st.textContent=''; },2500); }); }
  if(toggle&&apiInput)toggle.addEventListener('click',function(){
    apiInput.type=apiInput.type==='password'?'text':'password';
    toggle.textContent=apiInput.type==='password'?'Show':'Hide';
  });
});

var CTX=`You are a knowledgeable, warm, and empowering medical AI assistant helping Patient-XX, a healthy and active ~60-year-old woman in rural Spokane, WA with limited access to specialty care. She uses Providence Health / MyChart. Your role is to help her understand her health data and prepare excellent questions for her healthcare providers. You are NOT providing diagnoses, but educational analysis.

OFFICIAL DIAGNOSES (from Health Issues page):
ACTIVE: Essential Hypertension (since 9/17/2020), Leukopenia (since 3/11/2021), Vitamin D Deficiency (since 9/17/2020), Chronic Pain of Both Knees (since 6/24/2025), TMJ Arthritis (since 5/3/2017), TMJ Arthralgia (since 5/3/2017), Ganglion Cyst of Finger (since 5/7/2020)
RESOLVED/MANAGED: Menopausal Syndrome - resolved on HRT, OSA - resolved, Insomnia - resolved, Atrophic Vaginitis - resolved on vaginal HRT, Palpitations - managed with medication (Metoprolol), Chest Pain - resolved (associated with Sept 2022 event)

PREVENTIVE CARE STATUS:
OVERDUE: Tdap vaccine (last 2002!), Shingles vaccine, Pneumococcal vaccine, Influenza vaccine
UP TO DATE: Mammogram (last 9/16/2025, next 9/16/2027), PAP/HPV (last 3/18/2024, next 3/18/2029), Colonoscopy (last 3/30/2023, next 3/30/2033), Hep C (done 9/29/2017)
NOTE: Oct 2025 breast biopsy may affect mammogram schedule

CURRENT MEDICATIONS:
- Losartan 25mg daily (ARB - for Essential Hypertension) - Jan 2026
- Metoprolol Succinate 25mg daily (beta blocker - hypertension + palpitations) - Jan 2026
- Compounded Progesterone capsule daily at bedtime (Koru Pharmacy) - Dec 2025, Joy Vaughan PA-C
- Compounded Estrogen/Estriol cream TOPCLICK, 2 clicks topical/vaginal daily (Koru) - Aug 2025, Dr. Heather Brennan
- Compounded Vaginal cream PEARL, 2 clicks vaginally daily (Koru) - Aug 2025, Dr. Heather Brennan
- MetroNIDAZOLE 0.75% cream to nose twice daily (Rosacea) - Apr 2025
- Supplements: Folic Acid 800mcg, B12 1000mcg, Zinc 15, Vitamin C 100mg, Vitamin D3 5000 IU daily

MOST RECENT LABS (March 5, 2026):
CMP: Glucose 102 HIGH (ref 74-100 — trending up from 96 in 2025), Creatinine 0.78 Normal, eGFR >60 Normal, Na 138, K 3.9, Ca 9.2, AST 23, ALT 26, Alk Phos 65, Albumin 4.4 - most NORMAL
TSH: 4.394 uIU/mL (consistent high-normal pattern across 4 years: 4.258 Oct 2022, 4.687 ER Sep 2022)
Estradiol: 121 pg/mL (HIGH vs postmeno ref <54.7; on HRT)
Progesterone: 1.4 ng/mL (expected on HRT; postmeno ref 0.0-0.1)
Testosterone Total: 393 ng/dL VERY HIGH (ref 4-50 female) - nearly 8x upper limit
Testosterone Free: 5.8 pg/mL HIGH (ref 0.0-4.2)
DHEA-Sulfate: 115 ug/dL NORMAL (ref 29.4-220.5)

JUN 2025 LABS (pain workup):
BMP all normal. RF <10 Normal, ESR 7 Normal, ANA Negative, CCP Antibodies Negative. Autoimmune causes for knee pain ruled out.

APR 2024:
CBC: WBC 3.6 LOW (ref 4.0-10.8), ANC 1.7 LOW (ref 2.0-7.3) - Leukopenia/neutropenia. Pattern: also Abnormal in 2018, 2019, 2021, 2022.
Vitamin D: 27 ng/mL LOW (ref 30-119) - dropped from 38 (Oct 2022) despite D3 5000 IU daily
Estradiol on HRT: 34 pg/mL (provider said "looking good")

OCT 2022 (comprehensive pre-HRT baseline):
Hormones: Estradiol <5.0 (postmeno confirmed), FSH 73.2, LH 32.5
Thyroid: TSH 4.258, T3 Total 1.0 Normal, Cortisol AM 16.4 Normal
Vitamin D: 38 Normal. CMP: Glucose 69 (low-normal).
LIPIDS (Jun 2022): Total Chol 214 (borderline high), HDL 87 (excellent), LDL 112 (slightly high), TG 76 Normal, Chol/HDL ratio 2.5 (low CV risk)

SEPT 2022 ER VISIT: TSH 4.687 flagged HIGH. Troponin I x2 normal (no heart attack). Diagnoses: Palpitations + Chest Pain (both now resolved/managed). Followed by cardiac monitoring (all external results).

OCT 2025: Comprehensive breast workup after mammogram recall -> US-guided biopsy Oct 6. Pathology in external scan documents (critical - must discuss with Dr. Witham).

PROVIDERS: Dr. Rachael Witham DO (primary), Joy Vaughan PA-C, Dr. Heather M. Brennan MD (HRT), Kristen J. Hardy PA-C, Nancy L. Vitello Mikiska PA-C (cardiology)

Please be thorough, compassionate, and empowering. Help Patient-XX understand her full health picture and formulate excellent questions for her providers. Always note this is educational information to support her care, not replace it.`;

async function askC(){
  var k=document.getElementById('apiKey').value.trim();
  var q=document.getElementById('aiQ').value.trim();
  if(!k){alert('Please enter your Anthropic API key.\nGet a free key at: console.anthropic.com');return}
  if(!q){alert('Please type a question first.');return}
  document.getElementById('loading').style.display='block';
  document.getElementById('aiR').classList.remove('show');
  document.getElementById('aiR').innerHTML='';
  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'x-api-key':k,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:2048,system:CTX,messages:[{role:'user',content:q}]})
    });
    var d=await r.json();
    if(d.error)throw new Error(d.error.message||'API Error');
    var txt=d.content[0].text;
    var fmt=txt.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'</p><p style="margin-top:10px">').replace(/\n/g,'<br>');
    document.getElementById('loading').style.display='none';
    document.getElementById('aiR').innerHTML='<p>'+fmt+'</p><hr style="margin:16px 0;border:1px solid #e2e8f0"><p style="font-size:.8rem;color:#94a3b8">Educational information only — not medical advice. Always consult your healthcare provider.</p>';
    document.getElementById('aiR').classList.add('show');
    try{ var k=document.getElementById('apiKey').value.trim(); if(k)localStorage.setItem(API_KEY_STORAGE,k); }catch(e){}
  }catch(e){
    document.getElementById('loading').style.display='none';
    document.getElementById('aiR').innerHTML='<p style="color:#dc2626">Error: '+e.message+'</p><p style="font-size:.85rem;margin-top:8px;color:#64748b">Verify your API key at <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>. CORS may block direct browser calls — try hosting the file on a web server.</p>';
    document.getElementById('aiR').classList.add('show');
  }
}

// QR Code initialization
(function(){
  var container = document.getElementById('qrcode');
  var label = document.querySelector('.qr-label small');
  if(!container) return;
  var url = window.location.href;
  var isLocal = url.indexOf('file:')===0 || url.indexOf('blob:')===0;
  // For hosted pages (local network server or web), encode the actual URL so phones can scan & open.
  // For file://, encode a text label since file:// URLs can't be opened on other devices.
  var qrData = isLocal ? 'Patient-XX Health Plan' : url;
  var img = container.querySelector('img') || document.createElement('img');
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(qrData) + '&bgcolor=ffffff&color=1a3a5c';
  img.width = 100; img.height = 100;
  img.style.cssText = 'border-radius:6px;background:#fff;padding:4px;display:block';
  img.alt = 'QR Code';
  if(!container.querySelector('img')) container.appendChild(img);
  if(label) label.textContent = isLocal ? 'Serve via local web server to enable QR link' : 'Scan to open on another device';
})();