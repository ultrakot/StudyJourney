import {writeFileSync, mkdirSync} from 'node:fs';
import {videoCatalog} from '../src/videoCatalog';

// Optional maintainer check. No API key, browser cookies, transcript downloads, or runtime requests.
const queue=Object.entries(videoCatalog);
const results:{key:string;url:string;status:string;title?:string;channel?:string;error?:string}[]=[];
async function worker() {
  for(let item=queue.shift();item;item=queue.shift()) {
    const [key,video]=item;
    try {
      const response=await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.url)}`,{signal:AbortSignal.timeout(15000)});
      if(!response.ok) throw Error(`HTTP ${response.status}`);
      const metadata=await response.json() as {title?:string;author_name?:string};
      if(!metadata.title||!metadata.author_name) throw Error('Missing title or channel in metadata');
      results.push({key,url:video.url,status:'metadata-available',title:metadata.title,channel:metadata.author_name});
    } catch(error) {results.push({key,url:video.url,status:'unconfirmed',error:error instanceof Error?error.message:String(error)});}
  }
}
await Promise.all([worker(),worker(),worker(),worker()]);
results.sort((a,b)=>a.key.localeCompare(b.key));
mkdirSync(new URL('../docs/',import.meta.url),{recursive:true});
writeFileSync(new URL('../docs/video-link-check.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),method:'YouTube public oEmbed metadata. Confirms link metadata, not playback, content accuracy, or future availability.',results},null,2)+'\n');
const unconfirmed=results.filter(r=>r.status==='unconfirmed');
console.log(`${results.length-unconfirmed.length}/${results.length} videos returned title and channel metadata.`);
if(unconfirmed.length){console.log(JSON.stringify(unconfirmed,null,2));process.exitCode=1;}
