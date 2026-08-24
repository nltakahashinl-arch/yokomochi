import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyCBUb2FqVQouIgyWERxkNsRyRPT5BnsFvo',authDomain:'yokomochi-2d1ad.firebaseapp.com',projectId:'yokomochi-2d1ad',storageBucket:'yokomochi-2d1ad.firebasestorage.app',messagingSenderId:'527899321727',appId:'1:527899321727:web:6a00904d7197dabb47e64a'};
const SLOTS=['午前①便 9:30～','増便① 9:20～','午前②便 11:00～','増便② 11:00～','午後③便 14:30～','増便③ 15:30～','午後④便 16:30～','増便④ 16:30～'];
const DAYS=['月','火','水','木','金','土'];
const db=getFirestore(initializeApp(firebaseConfig));
let weekStart=startOfWeek(new Date()),records=[],unsub=null,editing=null;
const $=s=>document.querySelector(s);
$('#slotInput').innerHTML=SLOTS.map(s=>`<option>${s}</option>`).join('');
function startOfWeek(d){const x=new Date(d);x.setHours(12,0,0,0);const n=x.getDay()||7;x.setDate(x.getDate()-n+1);return x}
function at(i){const d=new Date(weekStart);d.setDate(d.getDate()+i);return d}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function jp(d){return `${d.getMonth()+1}月${d.getDate()}日`}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function message(text){$('#message').textContent=text;$('#message').hidden=!text}
function load(){if(unsub)unsub();$('#status').textContent='接続中';message('');const q=query(collection(db,'schedules'),where('weekStart','==',iso(weekStart)));unsub=onSnapshot(q,s=>{records=s.docs.map(d=>({id:d.id,...d.data()}));$('#status').textContent='共有データ同期中';render()},e=>{$('#status').textContent='接続エラー';message('Firestoreに接続できません。Firebaseのルール設定を確認してください。詳細: '+e.message)})}
function render(){const end=at(5);$('#rangeLabel').textContent=`${weekStart.getFullYear()}年 ${jp(weekStart)} ～ ${jp(end)}`;$('#paperRange').textContent=`${jp(weekStart)}（月）～ ${jp(end)}（土）`;let h='<div class="cell head">日付</div>'+SLOTS.map(s=>`<div class="cell head">${esc(s)}</div>`).join('');for(let i=0;i<6;i++){const d=at(i),ds=iso(d);h+=`<div class="cell day ${ds===iso(new Date())?'today':''}"><span>${jp(d)}</span><span>（${DAYS[i]}）</span></div>`;for(const slot of SLOTS){const r=records.find(x=>x.date===ds&&x.slot===slot);h+=`<div class="cell slot ${r?'':'empty'} ${r?.closed?'closed':''}" data-date="${ds}" data-slot="${esc(slot)}" data-id="${r?.id||''}">${r?`<div class="route">${esc(r.route)}</div><div class="driver">担当：${esc(r.driver||'')}</div>${r.pl?`<span class="pl">${esc(r.pl)}</span>`:''}${r.note?`<div class="note">＊備考＊<br>${esc(r.note)}</div>`:''}`:''}</div>`}}$('#scheduleGrid').innerHTML=h;$('#totals').innerHTML=`<span>登録便数 <b>${records.filter(r=>!r.closed).length}</b></span><span>予約不可枠 <b>${records.filter(r=>r.closed).length}</b></span>`}
function openEditor(date,slot,id=''){editing=records.find(r=>r.id===id)||null;$('#documentId').value=editing?.id||'';$('#dateInput').value=editing?.date||date;$('#slotInput').value=editing?.slot||slot;$('#routeInput').value=editing?.route||'';$('#driverInput').value=editing?.driver||'';$('#plInput').value=editing?.pl||'';$('#noteInput').value=editing?.note||'';$('#closedInput').checked=!!editing?.closed;$('#deleteBtn').style.visibility=editing?'visible':'hidden';$('#editor').showModal()}
$('#scheduleGrid').onclick=e=>{const c=e.target.closest('.slot');if(c)openEditor(c.dataset.date,c.dataset.slot,c.dataset.id)};
$('#newBtn').onclick=()=>openEditor(iso(new Date()),SLOTS[0]);
$('#closeBtn').onclick=$('#cancelBtn').onclick=()=>$('#editor').close();
$('#editForm').onsubmit=async e=>{e.preventDefault();const data={date:$('#dateInput').value,slot:$('#slotInput').value,route:$('#routeInput').value.trim(),driver:$('#driverInput').value.trim(),pl:$('#plInput').value.trim(),note:$('#noteInput').value.trim(),closed:$('#closedInput').checked,weekStart:iso(startOfWeek(new Date($('#dateInput').value+'T12:00:00'))),updatedAt:new Date().toISOString()};const id=editing?.id||`${data.date}_${SLOTS.indexOf(data.slot)}`;try{await setDoc(doc(db,'schedules',id),data);$('#editor').close()}catch(err){alert('保存できませんでした: '+err.message)}};
$('#deleteBtn').onclick=async()=>{if(!editing||!confirm('この予定を削除しますか？'))return;try{await deleteDoc(doc(db,'schedules',editing.id));$('#editor').close()}catch(err){alert('削除できませんでした: '+err.message)}};
$('#prevBtn').onclick=()=>{weekStart.setDate(weekStart.getDate()-7);load()};$('#nextBtn').onclick=()=>{weekStart.setDate(weekStart.getDate()+7);load()};$('#todayBtn').onclick=()=>{weekStart=startOfWeek(new Date());load()};$('#pdfBtn').onclick=()=>print();
load();
