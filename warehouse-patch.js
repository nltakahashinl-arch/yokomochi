import{initializeApp,getApps}from'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import{getFirestore,doc,onSnapshot,setDoc,collection,serverTimestamp}from'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const cfg={apiKey:'AIzaSyCBUb2FqVQouIgyWERxkNsRyRPT5BnsFvo',authDomain:'yokomochi-2d1ad.firebaseapp.com',projectId:'yokomochi-2d1ad',storageBucket:'yokomochi-2d1ad.firebasestorage.app',messagingSenderId:'527899321727',appId:'1:527899321727:web:6a00904d7197dabb47e64a'};
const app=getApps()[0]||initializeApp(cfg),db=getFirestore(app);

const fixed=[
{name:'株式会社東具 東大阪物流センター',address:'大阪府東大阪市稲田新町2-13-11',tel:'06-4309-9241',note:''},
{name:'株式会社石原物流',address:'大阪府摂津市鶴野3丁目3番24号',tel:'072-667-8798',note:''},
{name:'日建返却センター',address:'大阪府東大阪市本庄中2-4-4',tel:'',note:'大阪センコー運輸 東大阪営業所内'}
];
let editable=[{name:'倉庫4',address:'未登録',tel:'',note:''},{name:'倉庫5',address:'未登録',tel:'',note:''}];
const cards=document.querySelector('#warehouseCards');

function safe(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function renderCards(){
  if(!cards)return;
  cards.innerHTML=[...fixed,...editable].map((x,i)=>`<article class="warehouseCard ${i<3?'fixed':'editable'}"><strong>${safe(x.name)}</strong>${safe(x.address)}${x.tel?`\nTel：${safe(x.tel)}`:''}${x.note?`\n${safe(x.note)}`:''}${i>=3?`<button class="editWarehouse" data-index="${i-3}">編集</button>`:''}</article>`).join('');
}

if(cards){
  onSnapshot(doc(db,'settings','warehouses'),s=>{if(s.exists()&&Array.isArray(s.data().editable))editable=s.data().editable;renderCards()});
  cards.onclick=e=>{const b=e.target.closest('.editWarehouse');if(!b)return;const i=Number(b.dataset.index),x=editable[i];document.querySelector('#warehouseIndex').value=i;document.querySelector('#warehouseTitle').textContent=`倉庫${i+4}の編集`;document.querySelector('#warehouseName').value=x.name||'';document.querySelector('#warehouseAddress').value=x.address==='未登録'?'':x.address||'';document.querySelector('#warehouseTel').value=x.tel||'';document.querySelector('#warehouseNote').value=x.note||'';document.querySelector('#warehouseChangedBy').value='';document.querySelector('#warehouseEditDlg').showModal()};
  document.querySelector('#warehouseCancel').onclick=()=>document.querySelector('#warehouseEditDlg').close();
  document.querySelector('#warehouseForm').onsubmit=async e=>{e.preventDefault();const i=Number(document.querySelector('#warehouseIndex').value),who=document.querySelector('#warehouseChangedBy').value.trim(),before={...editable[i]},after={name:document.querySelector('#warehouseName').value.trim(),address:document.querySelector('#warehouseAddress').value.trim(),tel:document.querySelector('#warehouseTel').value.trim(),note:document.querySelector('#warehouseNote').value.trim()};if(!who)return alert('変更者を入力してください。');editable[i]=after;await setDoc(doc(db,'settings','warehouses'),{editable,updatedAt:serverTimestamp()},{merge:true});await setDoc(doc(collection(db,'histories')),{operation:'倉庫情報更新',changedBy:who,before,after,createdAt:serverTimestamp(),createdAtClient:new Date().toISOString()});document.querySelector('#warehouseEditDlg').close()};
}

function isRegistered(cell){return cell?.classList.contains('entry')&&!cell.classList.contains('empty')}
function resetGrayClasses(cell){cell.classList.remove('no-service-day','no-morning-service','no-afternoon-service')}

function patchGrid(){
  const grid=document.querySelector('#grid');
  if(!grid)return;

  const headers=[...grid.querySelectorAll('.head')];
  if(!headers.length)return;

  headers.forEach(h=>{if(h.textContent.includes('午前①便')&&h.textContent.includes('9:30'))h.textContent=h.textContent.replace('9:30','9:45')});
  const select=document.querySelector('#slot');
  if(select)[...select.options].forEach(o=>{if(o.textContent.includes('午前①便')&&o.textContent.includes('9:30'))o.textContent=o.textContent.replace('9:30','9:45')});

  const slotHeaders=headers.slice(1);
  const morningIndexes=[];
  const afternoonIndexes=[];
  slotHeaders.forEach((h,i)=>{
    const name=h.textContent.trim();
    if(name.includes('午前'))morningIndexes.push(i);
    if(name.includes('午後'))afternoonIndexes.push(i);
  });

  const columnCount=headers.length;
  const cells=[...grid.children];
  const dataCells=cells.slice(columnCount);
  const rowWidth=columnCount;

  for(let row=0;row<6;row++){
    const dayCells=dataCells.slice(row*rowWidth,(row+1)*rowWidth);
    if(dayCells.length!==rowWidth)continue;
    const dateCell=dayCells[0];
    const entries=dayCells.slice(1);
    dayCells.forEach(resetGrayClasses);

    const morning=morningIndexes.map(i=>entries[i]).filter(Boolean);
    const afternoon=afternoonIndexes.map(i=>entries[i]).filter(Boolean);
    const morningUsed=morning.some(isRegistered);
    const afternoonUsed=afternoon.some(isRegistered);
    const anyUsed=entries.some(isRegistered);

    if(!anyUsed){
      dayCells.forEach(c=>c.classList.add('no-service-day'));
      continue;
    }

    if(morning.length&&!morningUsed)morning.forEach(c=>c.classList.add('no-morning-service'));
    if(afternoon.length&&!afternoonUsed)afternoon.forEach(c=>c.classList.add('no-afternoon-service'));
    dateCell.classList.remove('no-service-day');
  }
}

const grid=document.querySelector('#grid');
if(grid)new MutationObserver(patchGrid).observe(grid,{childList:true,subtree:true});
patchGrid();
renderCards();
