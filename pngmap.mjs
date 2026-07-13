import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';

function decodePNG(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');
  let off = 8, w=0, h=0, colorType=0, idat=[];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off+4, off+8);
    const data = buf.subarray(off+8, off+8+len);
    if (type === 'IHDR') { w=data.readUInt32BE(0); h=data.readUInt32BE(4); colorType=data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  const paeth = (a,b,c) => { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:(pb<=pc?b:c); };
  for (let y=0; y<h; y++) {
    const f = raw[pos++];
    for (let x=0; x<stride; x++) {
      const v = raw[pos++];
      const a = x>=channels ? out[y*stride + x-channels] : 0;
      const b = y>0 ? out[(y-1)*stride + x] : 0;
      const c = (x>=channels && y>0) ? out[(y-1)*stride + x-channels] : 0;
      let r;
      if (f===0) r=v; else if (f===1) r=v+a; else if (f===2) r=v+b; else if (f===3) r=v+((a+b)>>1); else r=v+paeth(a,b,c);
      out[y*stride + x] = r & 0xff;
    }
  }
  return { w, h, channels, data: out, stride };
}

function classify(r,g,b) {
  const lum = (0.2126*r+0.7152*g+0.0722*b)/255;
  if (lum < 0.16) return '#';
  if (lum > 0.84) return '.';
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
  if (mx-mn < 24) return '+';
  if (b > r && b > g) return 'B';
  if (g >= r && g >= b) return 'G';
  if (r > g+30 && r > b+30) return (g > 120 ? 'Y' : 'R');
  return '?';
}

for (const f of process.argv.slice(2)) {
  const img = decodePNG(f);
  console.log(`\n===== ${f.split(/[\\/]/).pop()}  ${img.w}x${img.h} ch${img.channels} =====`);
  const hist = {};
  for (let i=0; i<img.data.length; i+=img.channels) {
    const r=img.data[i],g=img.data[i+1],b=img.data[i+2];
    const key=`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    hist[key]=(hist[key]||0)+1;
  }
  const top = Object.entries(hist).sort((a,b)=>b[1]-a[1]).slice(0,10);
  console.log('palette:', top.map(([k,v])=>`${k}(${((v/(img.w*img.h))*100)|0}%)`).join(' '));
  const cols=56, rows=Math.max(8, Math.round(cols*img.h/img.w/2));
  const sx=img.w/cols, sy=img.h/rows;
  let grid='';
  for (let ry=0; ry<rows; ry++) {
    let line='';
    for (let cx=0; cx<cols; cx++) {
      const px=Math.min(img.w-1, Math.floor(cx*sx+sx/2));
      const py=Math.min(img.h-1, Math.floor(ry*sy+sy/2));
      const i=py*img.stride+px*img.channels;
      line += classify(img.data[i],img.data[i+1],img.data[i+2]);
    }
    grid += line+'\n';
  }
  console.log(grid);
}
