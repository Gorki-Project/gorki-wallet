# Assets

To improve loading times and reduce the size and amount of files (assets) that we ship to users when the page is loaded, a few scripts have been put together.

`optimize-svgs.sh` depends on [svgcleaner](https://github.com/RazrFalcon/svgcleaner) (which is unmaintained -- it might be worthwhile to switch to something like [svgo](https://github.com/svg/svgo) at some point), which it uses to minify svgs and strip extraneous metadata.

`reindex.sh` is a bit more involved -- it attempts to detect used icons in the codebase and package only those icons up into a [single svg file](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol) (`icons/sheet.svg` which is then copied to `public/icons.svg`). This ensures that we only every ship icons that are actually used, dramatically reducing the size of the transferred assets.

Additionally, `reindex.sh` will create two more files:
    - `icons.tsx`, which provides a type-safe interface for embedding icons in the rest of the codebase. The `icon` function and the `Icon` component ensure that attempting to use an icon that does not exist in the `assets` folder results in a compile-time type error.
    - `viewer.html`, an html file that is useful for debugging the generated icons. It can be opened directly in the browser, where it will display all of the icons currently embedded in `icons/sheet.svg`.

`reindex.sh` will automatically run at dev-time whenever a file that uses icons is modified. This is done via a small vite plugin (`reindex-icons`) defined in `vite.config.ts`. It is, however, advisable to run the script manually before deploying the app.
