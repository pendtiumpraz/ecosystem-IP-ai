import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function processDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      await processDir(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      let content = await readFile(fullPath, 'utf-8');
      let modified = false;
      
      // Replace violet with orange
      const replacements = [
        [/violet-50/g, 'orange-50'],
        [/violet-100/g, 'orange-100'],
        [/violet-200/g, 'orange-200'],
        [/violet-300/g, 'orange-300'],
        [/violet-400/g, 'orange-400'],
        [/violet-500/g, 'orange-500'],
        [/violet-600/g, 'orange-600'],
        [/violet-700/g, 'orange-700'],
        [/violet-800/g, 'orange-800'],
        [/violet-900/g, 'orange-900'],
        [/indigo-500/g, 'amber-500'],
        [/indigo-600/g, 'amber-600'],
        [/indigo-700/g, 'amber-700'],
        [/purple-50/g, 'orange-50'],
        [/purple-100/g, 'orange-100'],
        [/purple-200/g, 'orange-200'],
        [/purple-300/g, 'orange-300'],
        [/purple-400/g, 'orange-400'],
        [/purple-500/g, 'orange-500'],
        [/purple-600/g, 'orange-600'],
        [/purple-700/g, 'orange-700'],
      ];
      
      for (const [pattern, replacement] of replacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        await writeFile(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir('./src').then(() => console.log('Done!'));
