#!/usr/bin/env node
// ItWorXs session-handoff: bewaart context tussen Claude-sessies.
// Gebruik (via .claude/settings.json hooks): node .claude/scripts/handoff.mjs <start|end>
// Pure Node, geen dependencies. Mag nooit een sessie blokkeren.
import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const HANDOFF = path.join(ROOT, '.claude', 'HANDOFF.md')
const ARCHIVE_DIR = path.join(ROOT, '.claude', 'handoffs')
const STALE_DAYS = 7
const MAX_ARCHIVES = 5
const MAX_CHANGED = 15

const SECTIONS = ['Waar ik aan werk', 'Volgende stappen', 'Beslissingen / context']
const PLACEHOLDER = '_(nog niet ingevuld — gebruik de itworxs-handoff skill)_'

function git(cmd) {
    try {
        return execSync('git ' + cmd, {
            cwd: ROOT,
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim()
    } catch {
        return ''
    }
}

function gitSnapshot() {
    const branch = git('rev-parse --abbrev-ref HEAD')
    if (!branch) return null
    return {
        branch,
        commits: git('log --oneline -5'),
        changed: git('status --short'),
    }
}

// Behoud handgeschreven secties bij het herschrijven.
async function readSections() {
    const out = {}
    for (const s of SECTIONS) out[s] = PLACEHOLDER
    if (!existsSync(HANDOFF)) return out
    const text = await fs.readFile(HANDOFF, 'utf8')
    for (const s of SECTIONS) {
        const esc = s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
        const m = text.match(new RegExp('## ' + esc + '\\n([\\s\\S]*?)(?=\\n## |$)'))
        if (m && m[1].trim()) out[s] = m[1].trim()
    }
    return out
}

function render(sections, snap) {
    const out = ['# Session Handoff', '', '_Laatst bijgewerkt: ' + new Date().toISOString() + '_', '']
    for (const s of SECTIONS) {
        out.push('## ' + s, sections[s] || PLACEHOLDER, '')
    }
    out.push('## Git-snapshot (automatisch)')
    if (snap) {
        out.push('- Branch: `' + snap.branch + '`')
        out.push('- Laatste commits:')
        for (const c of snap.commits ? snap.commits.split('\n') : []) out.push('  - ' + c)
        const ch = snap.changed ? snap.changed.split('\n') : []
        out.push('- Gewijzigde bestanden:')
        if (ch.length === 0) out.push('  - (geen wijzigingen)')
        else {
            for (const f of ch.slice(0, MAX_CHANGED)) out.push('  - ' + f)
            if (ch.length > MAX_CHANGED) out.push('  - ... +' + (ch.length - MAX_CHANGED) + ' meer')
        }
    } else {
        out.push('- (geen git-repo gedetecteerd)')
    }
    out.push('')
    return out.join('\n')
}

async function writeEnd() {
    const sections = await readSections()
    await fs.mkdir(path.dirname(HANDOFF), { recursive: true })
    await fs.writeFile(HANDOFF, render(sections, gitSnapshot()))
}

async function archive() {
    try {
        await fs.mkdir(ARCHIVE_DIR, { recursive: true })
        const stamp = new Date().toISOString().replace(/[:.]/g, '-')
        await fs.rename(HANDOFF, path.join(ARCHIVE_DIR, 'HANDOFF-' + stamp + '.md'))
        const files = (await fs.readdir(ARCHIVE_DIR)).filter(f => f.startsWith('HANDOFF-')).sort()
        while (files.length > MAX_ARCHIVES) {
            await fs.rm(path.join(ARCHIVE_DIR, files.shift()), { force: true })
        }
    } catch {
        /* niet kritisch */
    }
}

async function readStart() {
    if (!existsSync(HANDOFF)) return
    const stat = await fs.stat(HANDOFF)
    if ((Date.now() - stat.mtimeMs) / 86400000 > STALE_DAYS) {
        await archive()
        return
    }
    const text = await fs.readFile(HANDOFF, 'utf8')
    process.stdout.write('Context van de vorige sessie (handoff):\n\n' + text)
}

const mode = process.argv[2]
try {
    if (mode === 'end') await writeEnd()
    else if (mode === 'start') await readStart()
} catch {
    /* handoff mag nooit een sessie blokkeren */
}
