const Course={
  name:'Electrical & Electronic Engineering',
  title:'THU Electrical & Electronic Engineering',
  homeworks:[
    {id:1,topic:'Circuit fundamentals'},
    {id:2,topic:'Circuit analysis & AC'},
    {id:3,topic:''},
    {id:4,topic:''}
  ],
  sets(){
    const ids=[...new Set([...this.homeworks.map(h=>h.id),...Questions.map(q=>q.set)])].sort((a,b)=>a-b);
    return ids.map(id=>({id,title:'Homework '+String(id).padStart(2,'0'),topic:this.homeworks.find(h=>h.id===id)?.topic||'',questions:Questions.filter(q=>q.set===id)}));
  }
};
