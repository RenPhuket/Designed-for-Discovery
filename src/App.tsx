import { useEffect, useRef, useState } from 'react';
import content from './content.json';
import './styles.css';

type Picture = { src: string; small: string; width: number; height: number; smallWidth?: number; alt: string; caption?: string };
type Chapter = { id: string; title: string; subtitle: string; sourceSpread: number; paragraphs: string[]; images: Picture[]; layout?: string; note?: {title: string; text: string}; illustration?: Picture; quote?: string; timeline?: string[][]; tree?: {title:string;name:string;quote:string;text:string;uses:string[]}; craft?: Picture; continuation?: string[]; details?: Picture[]; concepts?: string[] };
const chapters: Chapter[] = content.chapters;
const url = (path: string) => `${import.meta.env.BASE_URL}${path}`;
function Photo({picture, priority=false, className=''}: {picture:Picture; priority?:boolean; className?:string}) {
 return <figure className={className}><img src={url(picture.src)} srcSet={!priority && picture.width>760?`${url(picture.small)} ${picture.smallWidth??760}w, ${url(picture.src)} ${picture.width}w`:undefined} sizes={priority?'100vw':'(max-width: 760px) 100vw, 60vw'} width={picture.width} height={picture.height} alt={picture.alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" />{picture.caption && <figcaption>{picture.caption}</figcaption>}</figure>;
}
function Story({chapter:c, index}: {chapter:Chapter; index:number}) {
 return <section id={c.id} tabIndex={-1} className={`chapter chapter-${index+1} ${c.layout??''}`} aria-labelledby={`${c.id}-title`}>
  <div className="chapter-label"><span>{String(index+1).padStart(2,'0')} / THE STORIES</span><a href="#chapters">Index ↑</a></div>
  <div className="story-grid">
   <div className="story-copy"><h2 id={`${c.id}-title`}>{c.title}</h2>{c.subtitle && <p className="subtitle">{c.subtitle}</p>}{c.illustration && <Photo picture={c.illustration} className="illustration"/>}<div className="prose">{c.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div>
   {c.tree && <aside className="tree"><h3>{c.tree.title}</h3><p>{c.tree.name}<br/><i>{c.tree.quote}</i></p><p>{c.tree.text}</p>{c.craft && <Photo picture={c.craft}/>}<ul>{c.tree.uses.map(u=><li key={u}>{u}</li>)}</ul></aside>}
   {c.note && <aside className="look"><span className="eyebrow">{c.note.title.toLowerCase()==='look up'?'Look up':'Look closer'}</span>{!['look closer','look up'].includes(c.note.title.toLowerCase()) && <h3>{c.note.title}</h3>}<p>{c.note.text}</p></aside>}
   {c.quote && <blockquote>{c.quote}</blockquote>}
   </div>
   <div className="story-images">{c.images.map((im,i)=><div key={im.src} className="image-item">{c.layout==='sequence' && <span className="image-number">0{i+1}</span>}<Photo picture={im}/></div>)}</div>
  </div>
  {c.timeline && <ol className="timeline">{c.timeline.map(([year,text])=><li key={year}><strong>{year}</strong><span>{text}</span></li>)}</ol>}
  {c.continuation && <div className="room-continuation"><div className="prose">{c.continuation.map(p=><p key={p}>{p}</p>)}</div><div className="concepts">{c.concepts?.map(x=><span key={x}>{x}</span>)}</div></div>}
  {c.details && <div className="detail-grid">{c.details.map(im=><Photo key={im.src} picture={im}/>)}</div>}
 </section>;
}
export default function App() {
 const [menu,setMenu]=useState(false);
 const [active,setActive]=useState('cover');
 const [progress,setProgress]=useState(0);
 const [mapOpen,setMapOpen]=useState(false);
 const [zoom,setZoom]=useState(1);
 const mapDialog=useRef<HTMLDialogElement>(null);
 const menuButton=useRef<HTMLButtonElement>(null);
 const mapButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const handle=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setProgress(max>0?window.scrollY/max:0);};
  handle();window.addEventListener('scroll',handle,{passive:true});window.addEventListener('resize',handle);
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id);},{rootMargin:'-15% 0px -65% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(el=>observer.observe(el));
  return()=>{window.removeEventListener('scroll',handle);window.removeEventListener('resize',handle);observer.disconnect();};
 },[]);
 useEffect(()=>{if(mapOpen){mapDialog.current?.showModal();document.body.style.overflow='hidden';}else{mapDialog.current?.close();document.body.style.overflow='';}return()=>{document.body.style.overflow='';};},[mapOpen]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);menuButton.current?.focus();}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[menu]);
 function closeMap(){setMapOpen(false);setZoom(1);mapButton.current?.focus();}
 function navigate(id:string){setMenu(false);requestAnimationFrame(()=>document.getElementById(id)?.focus({preventScroll:true}));}
 return <>
  <a className="skip" href="#main">Skip to stories</a>
  <header className="masthead"><a href="#cover" className="brand" aria-label="Renaissance Phuket — back to cover"><span className="brand-r" aria-hidden="true">R.</span><span>RENAISSANCE<br/><small>PHUKET RESORT & SPA</small></span></a><div className="header-links"><a className="guide-link" href={content.guideUrl}>Hotel guide ↗</a><button ref={menuButton} aria-expanded={menu} aria-controls="chapter-menu" onClick={()=>setMenu(!menu)}>{menu?'Close':'Chapters'} <span aria-hidden="true">{menu?'−':'+'}</span></button></div><div className="reading-progress" style={{transform:`scaleX(${progress})`}}/></header>
  <nav id="chapter-menu" className="chapter-menu" aria-label="Chapter navigation" hidden={!menu}><p className="eyebrow">Inside the booklet</p><ol>{chapters.map((c,i)=><li key={c.id}><a href={`#${c.id}`} onClick={()=>navigate(c.id)} aria-current={active===c.id?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span>{c.title}</a></li>)}<li><a href="#discovery-map" onClick={()=>navigate('discovery-map')}><span>10</span>Design Discovery Map</a></li></ol><a className="mobile-guide" href={content.guideUrl}>Return to the hotel guide ↗</a></nav>
  <main id="main" tabIndex={-1}>
   <section className="cover" id="cover" aria-labelledby="cover-title"><Photo picture={content.cover} priority/><div className="cover-shade"/><div className="cover-content"><p className="eyebrow">Renaissance Phuket Resort & Spa</p><h1 id="cover-title">Designed<br/><span>for Discovery</span></h1><div className="cover-bottom"><span>A DESIGN JOURNEY<br/>MAI KHAO · PHUKET</span><a href="#chapters">Explore the stories <span aria-hidden="true">↓</span></a></div></div></section>
   <section className="contents" id="chapters" aria-labelledby="contents-title"><div><span className="eyebrow">Architecture · Landscape · Local life</span><h2 id="contents-title">A closer look.<br/><em>A different perspective.</em></h2><p className="intro">The story of Renaissance Phuket Resort &amp; Spa begins with its setting.</p></div><nav aria-label="Contents"><ol>{chapters.map((c,i)=><li key={c.id}><a href={`#${c.id}`}><span>{String(i+1).padStart(2,'0')}</span>{c.title}<span aria-hidden="true">↗</span></a></li>)}<li><a href="#discovery-map"><span>10</span>Design Discovery Map<span aria-hidden="true">↗</span></a></li></ol></nav></section>
   {chapters.map((c,i)=><Story key={c.id} chapter={c} index={i}/>)}
   <section className="map-section" id="discovery-map" tabIndex={-1} aria-labelledby="map-title"><div className="chapter-label"><span>10 / TAKE THE STORY WITH YOU</span><a href="#chapters">Index ↑</a></div><div className="map-heading"><div><h2 id="map-title">Design Discovery Map</h2><p className="subtitle">Follow the story through the resort</p></div><button className="outline-button" ref={mapButton} onClick={()=>setMapOpen(true)}>Enlarge map ↗</button></div><Photo picture={content.map.image} className="map-image"/><ol className="map-stops">{content.map.stops.map(s=><li key={s.number}><span className="stop-number">{String(s.number).padStart(2,'0')}</span><div><a href={`#${s.chapter}`}>{s.title}<span aria-hidden="true"> ↗</span></a><p>{s.description}</p></div></li>)}</ol></section>
  </main>
  <footer><p className="footer-title">The story continues.</p><a className="outline-button" href={content.guideUrl}>Explore the hotel guide ↗</a><div className="footer-meta"><span>RENAISSANCE PHUKET RESORT & SPA</span><a href="#cover">Back to cover ↑</a></div>{content.source.status!=='approved-final' && <p className="edition">Editorial review edition · Source booklet: 8 October 2026 · Final approval unconfirmed</p>}</footer>
  <dialog ref={mapDialog} aria-labelledby="map-dialog-title" onCancel={closeMap} onClose={()=>{if(mapOpen)closeMap();}}><div className="map-toolbar"><h2 id="map-dialog-title">Design Discovery Map</h2><div><button onClick={()=>setZoom(Math.max(1,zoom-.5))} disabled={zoom===1} aria-label="Zoom out">−</button><output aria-live="polite">{Math.round(zoom*100)}%</output><button onClick={()=>setZoom(Math.min(3,zoom+.5))} disabled={zoom===3} aria-label="Zoom in">+</button><button onClick={closeMap} autoFocus>Close ×</button></div></div><p className="map-help">Zoom in, then scroll to explore. Press Escape to close.</p><div className="map-scroll" tabIndex={0} aria-label="Scrollable enlarged map"><img style={{width:`${zoom*100}%`}} src={url(content.map.image.src)} alt={content.map.image.alt}/></div><a className="map-original" href={url(content.map.image.src)} target="_blank" rel="noreferrer">Open full-size map in a new tab ↗</a></dialog>
 </>;
}
