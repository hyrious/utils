# @hyrious/utils

Common TypeScript utilities.

Some of the codes are taken from those big projects:

- [VS Code](https://github.com/microsoft/vscode/tree/main/src/vs/base) (MIT Licensed)
- [CodeMirror](https://github.com/codemirror/view/blob/main/src/dom.ts) (MIT Licensed)

## This package is in pure ESM.

- Bundlers should always prefer the ESM format to enable tree-shaking.
- Node.js now supports [Loading ECMAScript modules using `require()`](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require).
- If for some insane cases you still need to use the `<script>` (no `type=module`) or AMD loader to load an external module, you can access to the UMD build of this package manually.

## Code Style

- All utilities should not crash both in Node.js and browser.
- Prefer using functions over `/*#__PURE__*/` to delay the initialization.

## License

MIT @ [hyrious](https://github.com/hyrious)
