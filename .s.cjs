const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1960,height:900}});
await p.goto('http://localhost:4321/works/zencastr/v2/',{waitUntil:'load'});await p.waitForTimeout(2000);
await p.screenshot({path:'/tmp/a-top.png'});
const y=await p.evaluate(()=>document.querySelector('.zc-rm__row').getBoundingClientRect().top+scrollY);
await p.evaluate(y=>scrollTo(0,y-100),y);await p.waitForTimeout(1800);await p.screenshot({path:'/tmp/a-rm.png'});
const n=await p.evaluate(()=>document.querySelector('.number-box').getBoundingClientRect().top+scrollY);
await p.evaluate(y=>scrollTo(0,y-300),n);await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/a-num.png'});
await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(800);await p.screenshot({path:'/tmp/a-end.png'});
await b.close()})()
