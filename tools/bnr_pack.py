from PIL import Image
import struct
im=Image.open('banner_two.png').convert('RGB'); assert im.size==(96,32)
px=im.load(); img=bytearray()
for ty in range(8):
  for tx in range(24):
    for y in range(4):
      for x in range(4):
        r,g,b=px[tx*4+x,ty*4+y]
        img+=struct.pack('>H',0x8000|(r>>3)<<10|(g>>3)<<5|(b>>3))
assert len(img)==0x1800
def f(s,n):
    b=s.encode('latin-1'); assert len(b)<n, (s,len(b)); return b+b'\0'*(n-len(b))
out=b'BNR1'+b'\0'*0x1C+bytes(img)+f('Shardscape',0x20)+f('Shardscape',0x20)+f('Shardscape',0x40)+f('Shardscape',0x40)+f('Hex-terrain skirmish. Draft heroes, then battle\nbots or friends over the network.',0x80)
assert len(out)==0x1960
open('opening.bnr','wb').write(out); print(len(out))
# round-trip check: decode back to image
d=out[0x20:0x1820]; back=Image.new('RGB',(96,32)); bp=back.load(); i=0
for ty in range(8):
  for tx in range(24):
    for y in range(4):
      for x in range(4):
        v=struct.unpack('>H',d[i:i+2])[0]; i+=2
        bp[tx*4+x,ty*4+y]=(((v>>10)&31)*255//31,((v>>5)&31)*255//31,(v&31)*255//31)
back.resize((576,192),Image.NEAREST).save('decoded_6x.png')
