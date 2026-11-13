/* A small in-browser stand-in for Supabase, for the owner-panel tests only (tests/admin_flow.cjs).
   It follows the rules of supabase/migrations/0001_dosewaw_core.sql (checked for real in tests/sql/core_test.sql). */
(function(){
  const S=JSON.parse(sessionStorage.getItem('__fake')||'null')||{users:{},members:{},invites:{'owner@x.com':{role:'owner',name:'Owner'}},published:null,history:[],changes:[],session:null,next:1};
  const save=()=>sessionStorage.setItem('__fake',JSON.stringify(S));
  const me=()=>S.session&&S.members[S.session]&&S.members[S.session].active?S.members[S.session]:null;
  const role=()=>me()&&me().role;
  const err=m=>({data:null,error:{message:m}});
  const clean=d=>!/[<>]/.test(JSON.stringify(d));
  function apply(b,c){
    if(c.kind==='brand'){b.brand=Object.assign({},b.brand||{},c.data);return b}
    const k=c.kind==='drug'?'antibiotics':'sources';const list=b[k]=b[k]||[];const x=list.find(i=>String(i.id)===c.key);
    if(x)Object.assign(x,c.data);else list.push(Object.assign({id:c.kind==='source'?+c.key:c.key},c.data));return b}
  const rows=t=>{
    if(t==='members')return Object.values(S.members).filter(m=>role()==='owner'||m.user_id===S.session);
    if(t==='published')return S.published?[S.published]:[];
    if(t==='history')return role()?S.history:[];
    if(t==='changes')return role()==='owner'?S.changes:role()?S.changes.filter(c=>c.author===S.session):null;
    if(t==='reports')return role()==='owner'?(S.reports||[]):null;
    return [];
  };
  function query(t){
    const f=[];let ord=null,lim=null;
    const run=()=>{let r=rows(t);if(r===null)return err('permission denied for table '+t);r=JSON.parse(JSON.stringify(r)).filter(x=>f.every(([c,v])=>String(x[c])===String(v)));
      if(ord)r.sort((a,b)=>(a[ord.c]>b[ord.c]?1:-1)*(ord.asc?1:-1));if(lim)r=r.slice(0,lim);return {data:r,error:null}};
    const q={select(){return q},eq(c,v){f.push([c,v]);return q},order(c,o){ord={c,asc:!o||o.ascending!==false};return q},limit(n){lim=n;return q},
      maybeSingle(){const r=run();return Promise.resolve(r.error?r:{data:r.data[0]||null,error:null})},
      then(ok,no){return Promise.resolve(run()).then(ok,no)}};
    return q;
  }
  const rpc={
    seed_content({p_data}){if(role()!=='owner')return err('only the owner');if(S.published)return err('content already exists');S.published={id:1,version:1,data:p_data,note:'seed',published_at:new Date().toISOString()};return {data:1,error:null}},
    submit_change({p_kind,p_key,p_data,p_note}){const r=role();if(!r)return err('members only');if(p_kind==='brand'&&r!=='owner')return err('only the owner changes the visual identity');
      if(!clean(p_data)||!clean(p_note||''))return err('text may not contain < or >');
      const c={id:S.next++,kind:p_kind,key:p_key,data:p_data,note:p_note||'',status:r==='owner'?'approved':'pending',author:S.session,created_at:new Date().toISOString(),review_note:''};S.changes.push(c);return {data:c.id,error:null}},
    review_change({p_id,p_approve,p_note}){if(role()!=='owner')return err('only the owner reviews');const c=S.changes.find(x=>x.id===p_id&&x.status==='pending');if(!c)return err('no pending change');c.status=p_approve?'approved':'rejected';c.review_note=p_note||'';return {data:null,error:null}},
    publish_site({p_note}){if(role()!=='owner')return err('only the owner publishes');const cur=S.published,v=cur.version+1;let b=JSON.parse(JSON.stringify(cur.data));
      S.changes.filter(c=>c.status==='approved').forEach(c=>{b=apply(b,c);c.status='applied';c.applied_in=v});
      S.history.unshift({version:cur.version,data:cur.data,note:cur.note,published_at:cur.published_at});S.published={id:1,version:v,data:b,note:p_note||'',published_at:new Date().toISOString()};return {data:v,error:null}},
    rollback_to({p_version}){if(role()!=='owner')return err('only the owner');const old=S.history.find(h=>h.version===p_version);const cur=S.published,v=cur.version+1;
      S.history.unshift({version:cur.version,data:cur.data,note:cur.note,published_at:cur.published_at});S.published={id:1,version:v,data:old.data,note:'rollback to '+p_version,published_at:new Date().toISOString()};return {data:v,error:null}},
    invite_member({p_email,p_role,p_name}){if(role()!=='owner')return err('only the owner invites');S.invites[p_email.toLowerCase()]={role:p_role,name:p_name};return {data:null,error:null}},
    set_member_active({p_user,p_active}){if(role()!=='owner')return err('only the owner');if(p_user===S.session)return err('cannot stop own account');S.members[p_user].active=p_active;return {data:null,error:null}},
    submit_report({p_page,p_msg,p_lang}){if(!/^[a-z]\/[a-z0-9_]{1,40}$/.test(p_page)||!p_msg||p_msg.length<5||/[<>]/.test(p_msg))return err('invalid report');S.reports=S.reports||[];S.reports.push({id:S.next++,page:p_page,msg:p_msg,lang:p_lang,status:'new',created_at:new Date().toISOString()});return {data:null,error:null}},
    report_done({p_id}){if(role()!=='owner')return err('only the owner');const r=(S.reports||[]).find(x=>x.id===p_id);if(r)r.status='done';return {data:null,error:null}},
        pending_invites(){return {data:role()==='owner'?Object.entries(S.invites).filter(([e,i])=>!i.used).map(([email,i])=>({email,role:i.role,name:i.name})):[],error:null}}
  };
  window.__fake=S;
  window.supabase={createClient(){return {
    auth:{
      async getSession(){return {data:{session:S.session?{user:{id:S.session}}:null}}},
      async signInWithPassword({email,password}){const u=S.users[email.toLowerCase()];if(!u||u.password!==password)return {error:{message:'Invalid login credentials'}};S.session=u.id;save();return {error:null}},
      async signUp({email,password}){email=email.toLowerCase();const i=S.invites[email];if(!i||i.used)return {error:{message:'DOSEWAW: sign-up is by invitation only'}};
        const id='u'+(Object.keys(S.users).length+1);S.users[email]={id,password};S.members[id]={user_id:id,email,name:i.name,role:i.role,active:true,created_at:new Date().toISOString()};i.used=true;save();return {error:null}},
      async signOut(){S.session=null;save();return {error:null}}
    },
    from:query,
    async rpc(n,a){const r=rpc[n]?rpc[n](a||{}):err('no function '+n);save();return r}
  }}};
})();
