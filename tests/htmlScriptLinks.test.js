const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files = files.concat(getHtmlFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

describe('HTML script src paths', () => {
  const htmlFiles = getHtmlFiles(path.resolve(__dirname, '..'));

  htmlFiles.forEach((file) => {
    test(`${path.relative(process.cwd(), file)} has valid script src references`, () => {
      const html = fs.readFileSync(file, 'utf8');
      const regex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const src = match[1];
        if (/^https?:\/\//i.test(src) || src.startsWith('//')) {
          continue; // external script, ignore
        }
        const resolved = path.resolve(path.dirname(file), src.split('?')[0]);
        const exists = fs.existsSync(resolved);
        expect(exists).toBe(true);
      }
    });
  });
});
