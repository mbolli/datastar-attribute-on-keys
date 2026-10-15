// Highlights the code blocks marked with data-lang (html, json or shell) with the
// hl-* classes of the zwei und eins site. Shared by both plugin demos.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const span = (cls, s) => `<span class="hl-${cls}">${esc(s)}</span>`

// A Datastar expression: $signals and @actions stand out.
function expression(s) {
    return s.replace(/(\$[\w.]+)|(@\w+)|([^$@]+|[$@])/g, (_, sig, act, rest) =>
        sig ? span('variable', sig) : act ? span('keyword', act) : span('value', rest))
}

// An attribute name: data-on-keys:ctrl-s__delay.500ms has a plugin, a key and modifiers.
function attribute(name) {
    const m = name.match(/^(data-[\w-]+?)((?::[\w.-]+)?)((?:__[\w.]+)*)$/)
    if (!m) return span('property', name)
    return span('property', m[1]) + (m[2] ? span('type', m[2]) : '') + (m[3] ? span('attribute', m[3]) : '')
}

function json(s) {
    return s.replace(/("(?:[^"\\]|\\.)*")(\s*:)?|([{}[\],:])|([^"{}[\],:]+)/g, (_, str, colon, punct, rest) => {
        if (str) return colon ? span('property', str) + esc(colon) : span('value', str)
        return punct ? span('operator', punct) : esc(rest)
    })
}

function html(src) {
    let out = ''
    const re = /(<!--[\s\S]*?-->)|(<\/?)([\w-]+)((?:\s+[^\s=>]+(?:="[^"]*"|='[^']*')?)*)(\s*\/?>)|([^<]+|<)/g
    let m
    let inScript = false
    while ((m = re.exec(src))) {
        const [, comment, open, tag, attrs, close, text] = m
        if (comment) { out += span('comment', comment); continue }
        if (text !== undefined) { out += inScript && text.trim().startsWith('{') ? json(text) : esc(text); continue }
        out += esc(open) + span('keyword', tag)
        out += attrs.replace(/(\s+)([^\s=>]+)(?:=("[^"]*"|'[^']*'))?/g, (_, ws, name, value) => {
            if (!value) return ws + attribute(name)
            const quote = value[0]
            const inner = value.slice(1, -1)
            const shown = name.startsWith('data-') ? expression(inner) : span('value', inner)
            return ws + attribute(name) + esc('=') + span('value', quote) + shown + span('value', quote)
        })
        out += esc(close)
        inScript = open === '<' && tag === 'script'
    }
    return out
}

function shell(src) {
    return src.replace(/^(\s*)(\w+)(\s+\w+)?(.*)$/gm, (_, ws, cmd, sub, rest) =>
        esc(ws) + span('keyword', cmd) + (sub ? span('keyword', sub) : '') + span('value', rest))
}

// The attribute's syntax line: data-on-keys[:key-spec][__modifier]="action".
function syntax(src) {
    return src.replace(/^([\w-]+)((?:\[[^\]]*\])*)(=)("[^"]*")$/gm, (_, name, parts, eq, value) =>
        span('property', name) + parts.replace(/\[([^\]]*)\]/g, (_, p) => esc('[') + span(p.startsWith(':') ? 'type' : 'attribute', p) + esc(']')) + esc(eq) + span('value', value))
}

const languages = { html, json, shell, syntax }
for (const pre of document.querySelectorAll('pre[data-lang]')) {
    const target = pre.querySelector('code') ?? pre
    const highlight = languages[pre.dataset.lang]
    if (highlight) target.innerHTML = highlight(target.textContent)
}
