"""Original pixel artwork and six short synthesized effects; Python standard library only.

Default output is preparation artwork, outside the eventual client source tree.
Run with --output tetris/src/content/assets after the template is bootstrapped.
"""
import argparse
import math
from pathlib import Path
import struct
import wave
import zlib

parser=argparse.ArgumentParser()
parser.add_argument('--output',default='art-source')
args=parser.parse_args()
out=Path(args.output)
out.mkdir(parents=True,exist_ok=True)

def rgba(hexcode,alpha=255):
 return tuple(bytes.fromhex(hexcode.removeprefix('#')))+(alpha,)

class Pixels:
 def __init__(self,w,h,color=(0,0,0,0)):
  self.w,self.h=w,h
  self.data=bytearray(bytes(color)*(w*h))
 def dot(self,x,y,color):
  if 0<=x<self.w and 0<=y<self.h:
   index=(y*self.w+x)*4
   self.data[index:index+4]=bytes(color)
 def rect(self,x,y,w,h,color):
  for row in range(y,y+h):
   for column in range(x,x+w):self.dot(column,row,color)
 def save(self,name):
  def chunk(kind,data):
   return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
  raw=b''.join(b'\0'+self.data[y*self.w*4:(y+1)*self.w*4] for y in range(self.h))
  png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',self.w,self.h,8,6,0,0,0))
  (out/name).write_bytes(png+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

colors=['50dce7','ffcd58','bf8df2','80da88','ff768b','6c9fff','ffac69','647890']
def shade(color,factor):return tuple(min(255,round(c*factor)) for c in rgba(color)[:3])+(255,)

# Solid 0..7, local ghost 8..15, opponent outline 16..23, empty 24,
# two-pixel height marker 25, blocked-entry outline 26.
atlas=Pixels(27*16,16)
for index,color in enumerate(colors):
 x=index*16
 atlas.rect(x,0,16,16,rgba('0a1527'))
 atlas.rect(x+1,1,14,14,rgba(color))
 atlas.rect(x+2,2,12,2,shade(color,1.18))
 atlas.rect(x+1,4,2,10,shade(color,1.08))
 atlas.rect(x+3,13,12,2,shade(color,.57))
 atlas.rect(x+13,3,2,10,shade(color,.72))
 # Different embedded motifs keep the block families readable without color.
 for y in range(5,12):
  for px in range(5,12):
   pattern=[px==8, (px+y)%4==0, y==6 or px==8, px==y,
            px+y==16, px==5 or y==10, px==10 or y==5, (px+y)%5<2][index]
   if pattern:atlas.dot(x+px,y,shade(color,.66))
 for offset,alpha in [(8,200),(16,155)]:
  frame=(offset+index)*16
  for px in range(1,15):
   for y in ((1,2,13,14) if offset==16 else (1,14)):
    atlas.dot(frame+px,y,rgba(color,alpha))
  for y in range(1,15):
   for px in (1,14):atlas.dot(frame+px,y,rgba(color,alpha))
  for px,y in ((3,3),(12,3),(3,12),(12,12)):
   atlas.dot(frame+px,y,rgba(color,alpha))
atlas.rect(25*16,7,16,2,rgba('ffcd58',220))
for x in range(1,15):
 for y in (1,2,13,14):atlas.dot(26*16+x,y,rgba('ff768b'))
for y in range(1,15):
 for x in (1,2,13,14):atlas.dot(26*16+x,y,rgba('ff768b'))
atlas.save('blocks.png')

bg=Pixels(288,512,rgba('091122'))
# Subtle horizontal bands and two circuit rails frame the single play well.
for y in range(20,464):
 if y%8==0:bg.rect(0,y,288,1,rgba('0b1629'))
for rail in (4,282):
 bg.rect(rail,24,2,424,rgba('18334a'))
 for y in range(40,448,48):
  bg.rect(rail-2,y,6,6,rgba('2a556b'))
  bg.rect(rail,y+2,2,2,rgba('50dce7'))
bg.rect(60,24,168,36,rgba('14293e'))
bg.rect(64,28,160,28,rgba('0c192a'))
bg.rect(60,64,168,60,rgba('182e43'))
bg.rect(64,64,160,60,rgba('0d1d30'))
bg.rect(60,124,168,328,rgba('29485d'))
bg.rect(62,126,164,324,rgba('142b40'))
bg.rect(64,128,160,320,rgba('081221'))
for x in range(64,224,16):bg.rect(x,128,1,320,rgba('102237'))
for y in range(128,448,16):bg.rect(64,y,160,1,rgba('102237'))
bg.rect(60,124,168,2,rgba('50dce7'))
bg.rect(60,450,168,2,rgba('367084'))
for x in (60,224):
 for y in (124,444):
  bg.rect(x,y,4,8,rgba('ffcd58'))
bg.rect(8,128,44,320,rgba('101d30'))
bg.rect(236,128,44,320,rgba('101d30'))
for x in (8,236):
 bg.rect(x,128,44,2,rgba('29485d'))
 bg.rect(x,446,44,2,rgba('29485d'))
bg.rect(12,458,264,2,rgba('1c3a51'))
bg.save('duel-surface.png')

gutter=Pixels(64,64,rgba('060c17'))
for x,y in ((8,8),(40,24),(24,48)):
 gutter.rect(x,y,2,12,rgba('102239'))
 gutter.rect(x,y+10,18,2,rgba('102239'))
 gutter.rect(x+16,y+10,2,8,rgba('102239'))
 gutter.rect(x-1,y-1,4,4,rgba('193349'))
 gutter.rect(x,y,2,2,rgba('28526a'))
gutter.save('gutter.png')

effects={
 'move':(.045,[360,480],.13),
 'rotate':(.065,[480,720],.13),
 'release':(.11,[320,120],.18),
 'clear':(.22,[523.25,659.25,783.99,1046.5],.17),
 'warning':(.20,[220,330,220,330],.15),
 'result':(.36,[392,523.25,659.25,783.99],.16),
}
rate=22050
for name,(duration,notes,gain) in effects.items():
 samples=[]
 for n in range(round(duration*rate)):
  t=n/rate; phase=t/duration
  freq=notes[min(len(notes)-1,int(phase*len(notes)))]
  envelope=min(1,t/.004)*min(1,(duration-t)/.025)*(1-phase*.35)
  # A soft square wave with an overtone gives short, original arcade feedback.
  tone=math.sin(2*math.pi*freq*t)+.18*math.sin(6*math.pi*freq*t)
  samples.append(round(32767*gain*envelope*tone))
 with wave.open(str(out/f'{name}.wav'),'wb') as wav:
  wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
  wav.writeframes(struct.pack('<'+'h'*len(samples),*samples))
print(f'Wrote three original PNGs and six original WAVs to {out.resolve()}')
