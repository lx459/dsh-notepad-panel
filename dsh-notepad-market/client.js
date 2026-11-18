window.__ModuleLoader__.load({
  id: 'dsh-notepad-panel',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-notepad';
    const PANEL_ID = 'notepad';
    const STORAGE_KEY = 'dsh-notepad.notes.v1';

    const EN = {
      'panel.title': 'Notepad',
      'panel.subtitle': 'Notes stay on this device and save as you type',
      'action.new': 'New note',
      'action.delete': 'Delete',
      'action.confirmDelete': 'Delete?',
      'action.clearSearch': 'Clear search',
      'search.placeholder': 'Search notes',
      'empty.list': 'No notes yet. Use “New note” to start writing.',
      'empty.search': 'No notes match this search.',
      'empty.searchHidden': 'The note you are editing is outside these results.',
      'editor.titlePlaceholder': 'Note title',
      'editor.bodyPlaceholder': 'Write here…',
      'editor.blank': 'Select a note on the left, or create a new one.',
      'editor.saved': 'Saved',
      'unit.chars': 'characters',
      'unit.chars.one': 'character',
      'unit.lines': 'lines',
      'unit.lines.one': 'line',
      'unit.notes': 'notes',
      'unit.notes.one': 'note',
      'notice.recovered': 'Unreadable notes were backed up; a fresh note is open.',
      'notice.saveFailed': 'Not saved to local storage',
      'note.untitled': 'Untitled note',
      'note.blank': 'Empty note',
      'seed.title': 'Welcome to Notepad',
      'seed.body': 'A few quick tips:\n\n· Search the list on the left, then select a note to edit it.\n· Every change saves automatically and is still here after a restart.\n· Notes live in this browser only; they are never uploaded or synced.\n\nDelete this note whenever you like.',
    };

    const ZH = {
      'panel.title': '记事本',
      'panel.subtitle': '笔记保存在这台设备上，输入时自动保存',
      'action.new': '新建笔记',
      'action.delete': '删除',
      'action.confirmDelete': '确认删除？',
      'action.clearSearch': '清除搜索',
      'search.placeholder': '搜索标题或内容',
      'empty.list': '还没有笔记，点「新建笔记」开始记录。',
      'empty.search': '没有找到匹配的笔记。',
      'empty.searchHidden': '正在编辑的笔记不在这些结果中。',
      'editor.titlePlaceholder': '笔记标题',
      'editor.bodyPlaceholder': '在这里记录内容…',
      'editor.blank': '从左侧选择一条笔记，或新建一条。',
      'editor.saved': '已保存',
      'unit.chars': '字符',
      'unit.chars.one': '字符',
      'unit.lines': '行',
      'unit.lines.one': '行',
      'unit.notes': '条笔记',
      'unit.notes.one': '条笔记',
      'notice.recovered': '原有数据无法读取，已另存备份并打开一条新笔记。',
      'notice.saveFailed': '未能写入本机存储',
      'note.untitled': '未命名笔记',
      'note.blank': '空白笔记',
      'seed.title': '欢迎使用记事本',
      'seed.body': '几点小提示：\n\n· 左侧列表支持搜索，点选一条笔记即可开始编辑。\n· 输入时内容会自动保存，重新打开面板仍在。\n· 笔记只保存在当前浏览器，不会上传或同步。\n\n随时可以删除这条笔记。',
    };

    const ICON_PATHS = {
      notebook: [
        'M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A1.5 1.5 0 0 1 5 19.5z',
        'M8.5 3v18',
        'M12 8h4',
        'M12 12h4',
      ],
      plus: ['M12 5v14', 'M5 12h14'],
      search: ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M20 20l-4.2-4.2'],
      check: ['M5 12.5l4.2 4.2L19 7'],
      close: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'],
    };

    function Icon(props) {
      const paths = ICON_PATHS[props.name] || [];
      const size = props.size || 16;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        paths.map((d, index) => h('path', { key: index, d })),
      );
    }

    function uid() {
      return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function sanitizeNote(raw) {
      if (!raw || typeof raw !== 'object') return null;
      const createdAt = typeof raw.createdAt === 'number' && isFinite(raw.createdAt) ? raw.createdAt : Date.now();
      const updatedAt = typeof raw.updatedAt === 'number' && isFinite(raw.updatedAt) ? raw.updatedAt : createdAt;
      return {
        id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
        title: typeof raw.title === 'string' ? raw.title : '',
        body: typeof raw.body === 'string' ? raw.body : '',
        createdAt,
        updatedAt,
      };
    }

    const CORRUPT_KEY = STORAGE_KEY + '.corrupt';

    function readStore() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null || raw === '') return { status: 'absent' };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { status: 'corrupt', raw };
        const notes = Array.isArray(parsed.notes) ? parsed.notes.map(sanitizeNote).filter(Boolean) : [];
        const selectedId = typeof parsed.selectedId === 'string' ? parsed.selectedId : null;
        return { status: 'ok', notes, selectedId };
      } catch (error) {
        return { status: 'corrupt', raw: null };
      }
    }

    function backupCorrupt(raw) {
      try {
        const value = typeof raw === 'string' ? raw : window.localStorage.getItem(STORAGE_KEY);
        if (typeof value === 'string' && value) window.localStorage.setItem(CORRUPT_KEY, value);
      } catch (error) {
        // A disabled storage cannot keep the backup, but the panel still works.
      }
    }

    function writeStore(notes, selectedId) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, notes, selectedId }));
        return true;
      } catch (error) {
        return false;
      }
    }

    function countText(t, base, count) {
      return String(count) + ' ' + (count === 1 ? t(base + '.one') : t(base));
    }

    function createSeed(t) {
      const stamp = Date.now();
      return [{ id: uid(), title: t('seed.title'), body: t('seed.body'), createdAt: stamp, updatedAt: stamp }];
    }

    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function formatTime(stamp) {
      const date = new Date(stamp);
      if (!isFinite(date.getTime())) return '';
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
      }
      const month = date.getMonth() + 1;
      if (date.getFullYear() === now.getFullYear()) return month + '/' + date.getDate();
      return date.getFullYear() + '/' + month + '/' + date.getDate();
    }

    function firstLine(body) {
      const lines = body.split('\n');
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index].trim();
        if (line) return line;
      }
      return '';
    }

    function shorten(text, limit) {
      return text.length > limit ? text.slice(0, limit) + '…' : text;
    }

    function noteTitle(note, t) {
      const title = note.title.trim();
      if (title) return shorten(title, 60);
      const line = firstLine(note.body);
      return line ? shorten(line, 60) : t('note.untitled');
    }

    function notePreview(note, t) {
      let body = note.body;
      if (!note.title.trim()) {
        const lines = body.split('\n');
        const index = lines.findIndex((line) => line.trim());
        if (index >= 0) lines.splice(index, 1);
        body = lines.join('\n');
      }
      const text = body.replace(/\s+/g, ' ').trim();
      return text ? shorten(text, 80) : t('note.blank');
    }

    function useLocaleRevision(locale) {
      const [revision, setRevision] = React.useState(0);
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(() => setRevision((value) => value + 1));
      }, [locale]);
      return revision;
    }

    const CSS = [
      '.np-page{box-sizing:border-box;height:100%;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:16px;',
      'padding:calc(20px + var(--dsh-frame-top-clearance,0px)) 26px 18px max(26px,var(--dsh-frame-leading-clearance,0px));',
      'color:var(--dsw-alias-label-primary,#1f2328);font-family:var(--dsw-font-family,var(--dsh-font-family-content,ui-sans-serif,system-ui,sans-serif));',
      '--np-line:var(--dsw-alias-border-l1,rgba(15,23,42,.1));--np-muted:var(--dsw-alias-label-secondary,#6b7280);',
      '--np-brand:var(--dsw-alias-brand-primary,#2f6bd8);--np-surface:var(--dsw-alias-bg-layer-1,#ffffff);',
      '--np-soft:var(--dsw-alias-bg-layer-2,rgba(15,23,42,.05))}',
      '.np-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex:none}',
      '.np-title{margin:0;font-size:19px;line-height:1.3;font-weight:600;letter-spacing:.01em}',
      '.np-sub{margin:3px 0 0;font-size:12.5px;line-height:1.5;color:var(--np-muted)}',
      '.np-actions{display:flex;align-items:center;gap:10px;padding-top:2px}',
      '.np-saved{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--np-muted)}',
      '.np-grid{flex:1;min-height:0;display:grid;grid-template-columns:minmax(216px,300px) minmax(0,1fr);gap:16px}',
      '.np-card{border:1px solid var(--np-line);border-radius:12px;background:var(--np-surface);display:flex;flex-direction:column;min-height:0;overflow:hidden}',
      '.np-search{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--np-line);color:var(--np-muted);flex:none}',
      '.np-search input{flex:1;min-width:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;font-size:13px}',
      '.np-search input::placeholder{color:var(--np-muted)}',
      '.np-clear{display:inline-flex;border:0;background:transparent;color:var(--np-muted);cursor:pointer;padding:2px;border-radius:4px}',
      '.np-clear:hover{color:var(--dsw-alias-label-primary,#1f2328);background:var(--np-soft)}',
      '.np-count{padding:9px 14px 4px;font-size:11.5px;color:var(--np-muted);flex:none}',
      '.np-list{flex:1;min-height:0;overflow:auto;list-style:none;margin:0;padding:2px 8px 10px;display:flex;flex-direction:column;gap:2px}',
      '.np-note{width:100%;text-align:left;border:0;background:transparent;font:inherit;color:inherit;border-radius:8px;padding:9px 10px;cursor:pointer;display:flex;flex-direction:column;gap:3px}',
      '.np-note:hover{background:var(--np-soft)}',
      '.np-note[aria-current="true"]{background:var(--np-soft);background:color-mix(in srgb,var(--np-brand) 12%,transparent)}',
      '.np-note-title{font-size:13px;font-weight:600;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.np-note-preview{font-size:12px;line-height:1.4;color:var(--np-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
      '.np-note-time{font-size:11px;color:var(--np-muted);font-variant-numeric:tabular-nums}',
      '.np-empty-note{padding:16px 14px;font-size:12.5px;line-height:1.6;color:var(--np-muted);flex:none}',
      '.np-title-input{flex:none;border:0;outline:none;background:transparent;color:inherit;font:inherit;font-size:17px;font-weight:600;line-height:1.4;padding:16px 20px 6px}',
      '.np-title-input::placeholder{color:var(--np-muted);font-weight:500}',
      '.np-body-input{flex:1;min-height:0;resize:none;border:0;outline:none;background:transparent;color:inherit;font-family:inherit;font-size:13.5px;line-height:1.75;padding:6px 20px 16px}',
      '.np-body-input::placeholder{color:var(--np-muted)}',
      '.np-foot{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 14px;border-top:1px solid var(--np-line);font-size:12px;color:var(--np-muted)}',
      '.np-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--np-line);background:var(--np-surface);color:inherit;font:inherit;font-size:13px;cursor:pointer;transition:background .12s ease,border-color .12s ease}',
      '.np-btn:hover{background:var(--np-soft)}',
      '.np-btn:focus-visible{outline:2px solid var(--np-brand);outline-offset:2px}',
      '.np-primary{background:var(--np-brand);border-color:transparent;color:var(--dsw-alias-bg-base,#fff)}',
      '.np-primary:hover{background:var(--np-brand);filter:brightness(1.08)}',
      '.np-danger{color:var(--dsw-alias-state-error-primary,#d33)}',
      '.np-danger:hover{border-color:var(--dsw-alias-state-error-primary,#d33);background:var(--np-soft)}',
      '.np-warn{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--dsw-alias-state-warn-primary,#b45309)}',
      '.np-note:focus-visible,.np-clear:focus-visible,.np-search input:focus-visible,.np-title-input:focus-visible,.np-body-input:focus-visible{outline:2px solid var(--np-brand);outline-offset:-2px;border-radius:6px}',
      '.np-search:focus-within{border-bottom-color:color-mix(in srgb,var(--np-brand) 45%,var(--np-line))}',
      '.np-blank{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;color:var(--np-muted)}',
      '.np-blank p{margin:0;font-size:13px;line-height:1.6;max-width:280px}',
      '@media (max-width:900px){.np-page{padding:14px}.np-grid{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,38%) minmax(0,1fr)}}',
    ].join('');

    function NotepadPanel(props) {
      const t = props.t;
      const locale = props.locale;
      useLocaleRevision(locale);

      const [boot] = React.useState(readStore);
      const [notes, setNotes] = React.useState(() => {
        if (boot.status === 'ok' && boot.notes.length) return boot.notes;
        if (boot.status === 'corrupt') {
          backupCorrupt(boot.raw);
          return createSeed(t);
        }
        return createSeed(t);
      });
      const [selectedId, setSelectedId] = React.useState(() => (boot.status === 'ok' && boot.selectedId ? boot.selectedId : null));
      const [query, setQuery] = React.useState('');
      const [confirmId, setConfirmId] = React.useState(null);
      const [saveFailed, setSaveFailed] = React.useState(false);
      const [recovered, setRecovered] = React.useState(boot.status === 'corrupt');
      const [focusTick, setFocusTick] = React.useState(0);
      const titleRef = React.useRef(null);

      React.useEffect(() => {
        if (notes.length && !notes.some((note) => note.id === selectedId)) {
          setSelectedId(notes[0].id);
        }
      }, []);

      React.useEffect(() => {
        if (!focusTick) return;
        if (titleRef.current) titleRef.current.focus();
      }, [focusTick]);

      React.useEffect(() => {
        const stored = writeStore(notes, selectedId);
        setSaveFailed(!stored);
      }, [notes, selectedId]);

      React.useEffect(() => {
        if (confirmId === null) return undefined;
        const timer = window.setTimeout(() => setConfirmId(null), 3000);
        return () => window.clearTimeout(timer);
      }, [confirmId]);

      const needle = query.trim().toLowerCase();
      const active = notes.find((note) => note.id === selectedId) || null;
      const matches = needle
        ? notes.filter((note) => (note.title + '\n' + note.body).toLowerCase().indexOf(needle) >= 0)
        : notes;
      const visible = matches;
      const activeHidden = Boolean(needle && active && !matches.some((note) => note.id === active.id));

      function updateNote(id, patch) {
        setNotes((prev) => prev.map((note) => (note.id === id ? Object.assign({}, note, patch, { updatedAt: Date.now() }) : note)));
      }

      function createNote() {
        const stamp = Date.now();
        const note = { id: uid(), title: '', body: '', createdAt: stamp, updatedAt: stamp };
        setNotes((prev) => [note].concat(prev));
        setSelectedId(note.id);
        setQuery('');
        setFocusTick((value) => value + 1);
      }

      function removeNote(id) {
        const index = notes.findIndex((note) => note.id === id);
        const next = notes.filter((note) => note.id !== id);
        setNotes(next);
        setConfirmId(null);
        if (selectedId === id) {
          setSelectedId(next.length ? next[Math.min(index, next.length - 1)].id : null);
        }
      }

      function requestDelete(id) {
        if (confirmId === id) {
          removeNote(id);
          return;
        }
        setConfirmId(id);
      }

      function handleKeyDown(event) {
        if (event.key === 'Escape' && confirmId !== null) {
          event.stopPropagation();
          setConfirmId(null);
        }
      }

      return h(
        'div',
        { className: 'np-page', onKeyDown: handleKeyDown },
        h('style', { key: 'np-styles' }, CSS),
        h(
          'header',
          { className: 'np-head' },
          h(
            'div',
            null,
            h('h1', { className: 'np-title' }, t('panel.title')),
            h('p', { className: 'np-sub' }, t('panel.subtitle')),
            recovered ? h('p', { className: 'np-warn' }, t('notice.recovered')) : null,
          ),
          h(
            'div',
            { className: 'np-actions' },
            h(
              'span',
              { className: saveFailed ? 'np-warn' : 'np-saved', 'aria-live': 'polite' },
              saveFailed ? t('notice.saveFailed') : h(Icon, { name: 'check', size: 13 }),
              saveFailed ? null : t('editor.saved'),
            ),
            h(
              'button',
              { type: 'button', className: 'np-btn np-primary', onClick: createNote },
              h(Icon, { name: 'plus', size: 15 }),
              t('action.new'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'np-grid' },
          h(
            'div',
            { className: 'np-card' },
            h(
              'div',
              { className: 'np-search' },
              h(Icon, { name: 'search', size: 15 }),
              h('input', {
                value: query,
                onChange: (event) => setQuery(event.target.value),
                placeholder: t('search.placeholder'),
                'aria-label': t('search.placeholder'),
                spellCheck: false,
              }),
              query
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'np-clear',
                      onClick: () => setQuery(''),
                      title: t('action.clearSearch'),
                      'aria-label': t('action.clearSearch'),
                    },
                    h(Icon, { name: 'close', size: 13 }),
                  )
                : null,
            ),
            h('div', { className: 'np-count' }, countText(t, 'unit.notes', visible.length)),
            visible.length === 0
              ? h(
                  'div',
                  { className: 'np-empty-note' },
                  h('p', null, needle ? t('empty.search') : t('empty.list')),
                  activeHidden ? h('p', null, t('empty.searchHidden')) : null,
                )
              : h(
                  'ul',
                  { className: 'np-list' },
                  visible.map((note) =>
                    h(
                      'li',
                      { key: note.id },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'np-note',
                          'aria-current': note.id === selectedId ? 'true' : 'false',
                          onClick: () => setSelectedId(note.id),
                        },
                        h('span', { className: 'np-note-title' }, noteTitle(note, t)),
                        h('span', { className: 'np-note-preview' }, notePreview(note, t)),
                        h('span', { className: 'np-note-time' }, formatTime(note.updatedAt)),
                      ),
                    ),
                  ),
                ),
          ),
          h(
            'div',
            { className: 'np-card np-editor' },
            active
              ? [
                  h('input', {
                    key: 'title',
                    ref: titleRef,
                    className: 'np-title-input',
                    value: active.title,
                    onChange: (event) => updateNote(active.id, { title: event.target.value }),
                    placeholder: t('editor.titlePlaceholder'),
                    'aria-label': t('editor.titlePlaceholder'),
                  }),
                  h('textarea', {
                    key: 'body',
                    className: 'np-body-input',
                    value: active.body,
                    onChange: (event) => updateNote(active.id, { body: event.target.value }),
                    placeholder: t('editor.bodyPlaceholder'),
                    'aria-label': t('editor.bodyPlaceholder'),
                    spellCheck: false,
                  }),
                  h(
                    'footer',
                    { key: 'foot', className: 'np-foot' },
                    h(
                      'span',
                      null,
                      countText(t, 'unit.chars', active.body.length) +
                        ' · ' +
                        countText(t, 'unit.lines', active.body ? active.body.split('\n').length : 0),
                    ),
                    h(
                      'button',
                      { type: 'button', className: 'np-btn np-danger', onClick: () => requestDelete(active.id) },
                      confirmId === active.id ? t('action.confirmDelete') : t('action.delete'),
                    ),
                  ),
                ]
              : h(
                  'div',
                  { className: 'np-blank' },
                  h(Icon, { name: 'notebook', size: 32 }),
                  h('p', null, t('editor.blank')),
                  h(
                    'button',
                    { type: 'button', className: 'np-btn', onClick: createNote },
                    h(Icon, { name: 'plus', size: 15 }),
                    t('action.new'),
                  ),
                ),
          ),
        ),
      );
    }

    function NotepadIcon(props) {
      return h(Icon, { name: 'notebook', size: props.size || 20 });
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.locale;
        const t = locale.bind(NS);

        ctx.effect(() => {
          const offEnglish = locale.register(NS, 'en', EN);
          const offChinese = locale.register(NS, 'zh', ZH);
          return () => {
            offEnglish();
            offChinese();
          };
        });

        ctx.effect(() => {
          const offMain = ctx.slots.inject('main', () =>
            ctx.slots.register({ name: 'main', key: PANEL_ID }, function NotepadPage() {
              return h(NotepadPanel, { t, locale });
            }),
          );
          const offSidebar = ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              { name: 'sidebar.panellist', id: PANEL_ID, order: 45, label: () => t('panel.title') },
              NotepadIcon,
            ),
          );
          return () => {
            if (typeof offMain === 'function') offMain();
            if (typeof offSidebar === 'function') offSidebar();
          };
        });
      },
    };
  },
});
