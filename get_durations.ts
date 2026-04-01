import ytdl from 'ytdl-core';

const urls = [
  'https://www.youtube.com/watch?v=RZAJI5XJcUQ',
  'https://www.youtube.com/watch?v=wGXKLmQBmkk',
  'https://www.youtube.com/watch?v=JK_fTjO9opo',
  'https://www.youtube.com/watch?v=QJ1a-Up9E54',
  'https://www.youtube.com/watch?v=z_cIF3BGctM',
  'https://www.youtube.com/watch?v=prZHwG_VrRw',
  'https://www.youtube.com/watch?v=jw8l-lwhP0E',
  'https://www.youtube.com/watch?v=NfLrj05O2TE',
  'https://www.youtube.com/watch?v=fwwQH_CESE4',
  'https://www.youtube.com/watch?v=qmD72JtwP3I',
  'https://www.youtube.com/watch?v=A1tyhN1NCdA',
  'https://www.youtube.com/watch?v=0_48hz_xiGM',
  'https://www.youtube.com/watch?v=sG3JOQKlpEs',
  'https://www.youtube.com/watch?v=xLYXQkMjI8w',
  'https://www.youtube.com/watch?v=ADYdypHZb2A',
  'https://www.youtube.com/watch?v=NDRh8GqRE5g',
  'https://www.youtube.com/watch?v=rYJ5eo3gjMA',
  'https://www.youtube.com/watch?v=HKNBm4HGw2c',
  'https://www.youtube.com/watch?v=PEaXF1_t6Jo',
  'https://www.youtube.com/watch?v=MemWIozSyrM',
  'https://www.youtube.com/watch?v=4_UcA5l6IWU',
  'https://www.youtube.com/watch?v=Gx5xHmBPTXg',
  'https://www.youtube.com/watch?v=Td9tYfG8cpQ',
  'https://www.youtube.com/watch?v=QIZe-20JBtQ'
];

async function getDurations() {
  for (const url of urls) {
    try {
      const info = await ytdl.getBasicInfo(url);
      console.log(`${url}: ${info.videoDetails.lengthSeconds} seconds`);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }
}

getDurations();
