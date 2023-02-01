const encoderCommands = {
  TO_AAC: ['-i', 'audio.file', '-c:a', 'aac', '-b:a', '160k', 'output.m4a'],
  TO_MP3: [
    '-i',
    'audio.file',
    '-vn',
    '-ar',
    '44100',
    '-ac',
    '2',
    '-b:a',
    '192k',
    'output.mp3',
  ],
  TO_WEBM: [
    '-i',
    'rawvisual.file',
    '-c',
    'vp9',
    '-b:v',
    '0',
    '-crf',
    '40',
    'visual.webm',
  ],
  TO_MP4: [
    '-i',
    'rawvisual.file',
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    'visual.mp4',
  ],
  TO_COPY_BUFFER: [
    '-stream_loop',
    '-1',
    '-i',
    'VFILE',
    '-i',
    'audio.file',
    '-c:v',
    'copy',
    '-t',
    'TIME',
    'OUTPUT',
  ],
};

export default encoderCommands;