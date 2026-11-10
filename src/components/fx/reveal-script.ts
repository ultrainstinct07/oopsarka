/**
 * Scroll reveals, as a tiny inline script (runs before first paint, no React).
 *
 *   data-reveal            one element: "up" (default) | "pop" | "left" | "right" | "fade"
 *   data-reveal-stagger    a group: its children come in one after another (same kinds)
 *
 * Each target gets a paused Web Animation that holds its "from" state; an
 * IntersectionObserver plays it on entry. Nothing is written to the DOM, so React
 * hydration is untouched, and without JavaScript (or with reduced motion / Calm
 * mode) the content is simply there. `.marker` swashes inside a target draw on.
 * Only `opacity` and the individual `translate`/`scale`/`rotate` properties are
 * animated, so elements keep their own transforms and hover effects.
 */
export const revealScript = `(function(){
var d=document,r=d.documentElement,w=window;
if(!w.IntersectionObserver||!w.MutationObserver||!r.animate)return;
var mq=w.matchMedia('(prefers-reduced-motion: reduce)');
function off(){return mq.matches||r.getAttribute('data-calm')==='true'}
var S='[data-reveal],[data-reveal-stagger]',E='cubic-bezier(.2,.8,.2,1)',held=new Map();
var F={up:{translate:'0 28px'},pop:{translate:'0 20px',scale:'.93',rotate:'-2deg'},left:{translate:'-36px 0'},right:{translate:'36px 0'},fade:{}};
function prep(el,kind,i){
var f={opacity:0},k=F[kind]||F.up;for(var p in k)f[p]=k[p];
var a=el.animate([f],{duration:kind==='pop'?820:720,delay:Math.min(i,8)*85,easing:E,fill:'backwards'});
a.pause();return a}
function add(el){
if(held.has(el)||off())return;
var l=[],i,g=el.getAttribute('data-reveal-stagger');
if(g!==null){for(i=0;i<el.children.length;i++)l.push(prep(el.children[i],g,i))}
else l.push(prep(el,el.getAttribute('data-reveal'),0));
var m=el.querySelectorAll('.marker');
for(i=0;i<m.length;i++){var a=m[i].animate([{backgroundSize:'0% 0.52em'}],{duration:700,delay:380,easing:E,fill:'backwards'});a.pause();l.push(a)}
held.set(el,l);io.observe(el)}
function play(el){var l=held.get(el);if(!l)return;held.delete(el);io.unobserve(el);l.forEach(function(a){a.play()})}
function flush(){held.forEach(function(l,el){io.unobserve(el);l.forEach(function(a){a.cancel()})});held.clear()}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)play(e.target)})},{rootMargin:'0px 0px -9% 0px'});
function scan(n){
if(n.nodeType!==1)return;
if(n.matches(S))add(n);
var q=n.querySelectorAll(S);for(var i=0;i<q.length;i++)add(q[i])}
new MutationObserver(function(ms){
ms.forEach(function(m){for(var i=0;i<m.addedNodes.length;i++)scan(m.addedNodes[i])});
held.forEach(function(l,el){if(!el.isConnected){io.unobserve(el);held.delete(el)}})
}).observe(r,{childList:true,subtree:true});
new MutationObserver(function(){if(off())flush()}).observe(r,{attributes:true,attributeFilter:['data-calm']});
mq.addEventListener&&mq.addEventListener('change',function(){if(off())flush()});
w.addEventListener('beforeprint',flush);
})()`
