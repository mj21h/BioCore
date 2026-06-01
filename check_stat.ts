import fs from 'fs';
console.log('foreground mtime:', fs.statSync('android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png').mtime);
console.log('icon mtime:', fs.statSync('android/app/src/main/res/mipmap-mdpi/ic_launcher.png').mtime);
console.log('size foreground:', fs.statSync('android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png').size);
console.log('size icon:', fs.statSync('android/app/src/main/res/mipmap-mdpi/ic_launcher.png').size);
