# @hyrious/utils

Common TypeScript utilities.

> [!NOTE]
> I'm trying to release this package as [TypeScript-only](https://nodejs.org/api/typescript.html).\
> Node.js >= v22.6.0 should be able to import from this package directly.

Utilities in this package are organized in [the VS Code style](https://github.com/microsoft/vscode/wiki/Source-Code-Organization):

```
base (layer)
└── common (environment)
    └── symbols.ts (utilities)
```

That is to say, you're supposed to import each utility with different path instead of one.
This way you can have 1) file-based tree-shaking and 2) multiple files using the same variable name.
In a word, it makes the life easier without barrel files.

## Usage

Add this repo as a dependency to your project.
See https://docs.npmjs.com/cli/v11/configuring-npm/package-json#github-urls.

```json
"dependencies": {
  "hyrious": "hyrious/utils#39c5bbff"
}
```

Import each utility:

```ts
import { Disposable } from 'hyrious/base/common/dispose.ts'

class MyService extends Disposable {}
```

## Code Style

- No dependencies.
  - If used to extend some library, it is exported as pure functions.
- Everything is pure, prefer using classes over closures for logic involving states.
  - If you like closures, see [wopjs](https://github.com/wopjs/disposable).

## Credits

- [Lib0](https://github.com/dmonad/lib0), the utilities behind [Yjs](https://github.com/yjs/yjs).
- [CodeMirror](https://github.com/codemirror/view/blob/main/src/dom.ts), made by the author of [Eloquent JavaScript](https://eloquentjavascript.net/00_intro.html).
- [VS Code](https://github.com/microsoft/vscode/tree/main/src/vs/base), the well-known code editor based on web.

## License

MIT @ [hyrious](https://github.com/hyrious)
