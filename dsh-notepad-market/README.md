# dsh-notepad-panel

A Notepad panel for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web GUI. It adds a notebook icon to the sidebar that opens a full-height page: a note list on the left, a plain-text editor on the right.

![The Notepad panel](docs/preview.svg)

## What it does

- Keeps multiple notes. Create one with the **+** button, delete with a two-step confirm (click once, click again within three seconds, or press Esc).
- Filters the list as you type in the search field; the count line reports how many notes matched.
- Autosaves the open note to this browser's `localStorage` (key `dsh-notepad.notes.v1`) shortly after you stop typing, and reports when a write fails instead of claiming success.
- Shows the character and line count of the open note.
- Follows the host light/dark theme and takes its UI text from the active locale (Chinese and English are included).
- Keeps one seed note on first run so the panel is never empty.

Notes live in the browser profile, not in the workspace: clearing site data for the GUI removes them. If the stored blob is ever unreadable, the plugin copies it to `dsh-notepad.notes.v1.corrupt` before starting over, so the raw text is not silently destroyed.

## Install

```sh
dsh plugin add github:lx459/dsh-notepad-panel
```

Then restart DeepSeek Harness (or reload the web GUI) and use the notebook icon in the sidebar.

Uninstall with:

```sh
dsh plugin remove dsh-notepad-panel
```

## Requirements

- A DSH build whose web GUI provides the `sidebar.panellist` and `main` slots (DSH 0.2.x).
- No build step: the package ships plain JavaScript. `client.js` is loaded by the host module loader, and `index.js` is an empty host half.

## Layout

```
dsh-notepad-panel/
├── package.json        # dsh.bundle (installable) + dsh.client (browser half)
├── cordis.patch.yml    # inserts the plugin row into the host composition
├── index.js            # host half: no behaviour, exists so the bundle composes
├── client.js           # the panel: slot registrations, state, styles
├── locale/en.json      # title, description, detail document
├── locale/zh.json
├── docs/DETAIL.md      # detail page for the Plugins list
├── docs/DETAIL.zh.md
├── docs/preview.svg
├── icon.svg
└── assets/icon-180.png # storefront tile
```

## License

MIT
