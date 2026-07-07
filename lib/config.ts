// Returns the base path for static assets on GitHub Pages.
// When deployed to username.github.io/repo-name/, the basePath is /repo-name.
// Next.js basePath handles page routes but not raw iframe src attributes.
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/pks-personal-growth-system' : '';

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

export { BASE_PATH };
