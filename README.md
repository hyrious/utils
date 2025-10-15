# @hyrious/utils

Common TypeScript utilities.

## Usage

I haven't publish the package. So you can just copy-paste files to your repo to use them.

## Code Style

- No dependencies.
  - If used to extend some library, it is exported as pure functions.
- Everything is pure, prefer using classes over closures for logic involving states.
  - If you like closures, see [wopjs](https://github.com/wopjs/disposable).

Utilities in this package are organized in [the VS Code style](https://github.com/microsoft/vscode/wiki/Source-Code-Organization):

```
base (layer)
└── common (environment)
    └── symbols.ts (utilities)
```

## Credits

- [Lib0](https://github.com/dmonad/lib0), the utilities behind [Yjs](https://github.com/yjs/yjs).
- [CodeMirror](https://github.com/codemirror/view/blob/main/src/dom.ts), made by the author of [Eloquent JavaScript](https://eloquentjavascript.net/00_intro.html).
- [VS Code](https://github.com/microsoft/vscode/tree/main/src/vs/base), the well-known code editor based on web.

## License

MIT @ [hyrious](https://github.com/hyrious)
