import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime='nodejs';
export const dynamic='force-static';
export const size={width:180,height:180};
export const contentType='image/png';

export default async function AppleIcon() {
  const image=await readFile(path.join(process.cwd(),'public/images/brand/icon-source.png'));
  return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',alignItems:'center',justifyContent:'center',background:'#f5f2eb'}}><img src={`data:image/png;base64,${image.toString('base64')}`} width={164} height={164} alt=""/></div>,size);
}
