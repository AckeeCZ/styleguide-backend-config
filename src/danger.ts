import { get } from 'https'
import * as Danger from 'danger'
import {
  Text,
  validateText,
  constructSettingsForText,
  getDefaultSettings,
  mergeSettings,
  getLanguagesForExt,
  TextDocumentOffset,
} from 'cspell-lib'
import { extname, resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
const branchTypes = [
  'fix',
  'feat',
  'chore',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
]

const BRANCH_GUIDE =
  'https://github.com/AckeeCZ/styleguide/blob/master/git/guides/branch-naming.md'
const MSG_GUIDE =
  'https://github.com/AckeeCZ/styleguide/blob/master/git/guides/commit-message.md'
const COMMIT_GUIDE =
  'https://github.com/AckeeCZ/styleguide/blob/master/git/guides/authoring-commits.md'

const EMAIL_REG = new RegExp('@(ack.ee|ackee.cz)$')

const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.substr(1)}`
const codes = (str: string) =>
  Array.from(Array(str.length).keys())
    .map(i => `\\${str.charCodeAt(i)}`)
    .join('')

type Gitmoji = Record<'emoji' | 'code', string>
const getGitmoji = () =>
  new Promise<Gitmoji[]>((resolve, reject) => {
    get(
      'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json',
      res => {
        res.setEncoding('utf8')
        let body = ''
        res.on('data', (data: string) => {
          body += data
        })
        res.on('error', reject)
        res.on('end', () => {
          resolve(JSON.parse(body).gitmojis)
        })
      }
    )
  })

const absolutePath = (relPath: string) =>
  resolve(__dirname, '..', '..', '..', relPath) // node_modules / styleguide-backend-config / dist

const getTyposForText = async (
  text: string,
  filename: string,
  ignoreWords?: string[]
) => {
  const config = constructSettingsForText(
    mergeSettings(getDefaultSettings(), {
      ignoreWords,
      allowCompoundWords: true, // allow dangerfile as danger-file
    }),
    text,
    getLanguagesForExt(extname(filename))
  )
  const offsets = await validateText(text, config)
  return Text.calculateTextDocumentOffsets(filename, text, offsets)
}

const groupTypos = (typos: Text.TextDocumentOffset[]) =>
  Object.values(
    typos.reduce((r: Record<string, Text.TextDocumentOffset[]>, v) => {
      ;(r[v.text.toLowerCase()] || (r[v.text.toLowerCase()] = [])).push(v)
      return r
    }, {})
  )

enum OffenseType {
  BRANCH_FORMAT = 'BRANCH_FORMAT',
  BRANCH_TYPE = 'BRANCH_TYPE',
  BRANCH_NOT_DELETED = 'BRANCH_NOT_DELETED',
  COMMIT_MISSING_TRACKER_REFERENCE = 'COMMIT_MISSING_TRACKER_REFERENCE',
  COMMIT_BRANCH_TRACKER_REFERENCE_MISMATCH = 'COMMIT_BRANCH_TRACKER_REFERENCE_MISMATCH',
  COMMIT_MESSAGE_LENGTH = 'COMMIT_MESSAGE_LENGTH',
  COMMIT_MESSAGE_FORMAT = 'COMMIT_MESSAGE_FORMAT',
  COMMIT_MESSAGE_INVALID_GITMOJI = 'COMMIT_MESSAGE_INVALID_GITMOJI',
  COMMIT_MESSAGE_TYPO = 'COMMIT_MESSAGE_TYPO',
  COMMIT_INVALID_AUTHOR_EMAIL = 'COMMIT_INVALID_AUTHOR_EMAIL',
  COMMIT_FIXUP = 'COMMIT_FIXUP',
  COMMIT_MERGE = 'COMMIT_MERGE',
  CODE_TYPO = 'CODE_TYPO',
}
type Offense =
  | {
      type: OffenseType.BRANCH_FORMAT
      branchName: string
    }
  | {
      type: OffenseType.BRANCH_TYPE
      branchType: string
    }
  | {
      type: OffenseType.BRANCH_NOT_DELETED
    }
  | {
      type: OffenseType.COMMIT_MISSING_TRACKER_REFERENCE
      sha: string
    }
  | {
      type: OffenseType.COMMIT_BRANCH_TRACKER_REFERENCE_MISMATCH
      sha: string
      expectedReference: string
      found: string[]
    }
  | {
      type: OffenseType.COMMIT_MESSAGE_LENGTH
      sha: string
      length: number
    }
  | {
      type: OffenseType.COMMIT_MESSAGE_FORMAT
      sha: string
      diff: string
    }
  | {
      type: OffenseType.COMMIT_MESSAGE_INVALID_GITMOJI
      sha: string
      found: string
    }
  | {
      type: OffenseType.COMMIT_MESSAGE_TYPO
      sha: string
      word: string
    }
  | {
      type: OffenseType.CODE_TYPO
      typos: Text.TextDocumentOffset[]
    }
  | {
      type: OffenseType.COMMIT_INVALID_AUTHOR_EMAIL
      sha: string
      found: string
    }
  | {
      type: OffenseType.COMMIT_FIXUP
      sha: string
    }
  | {
      type: OffenseType.COMMIT_MERGE
      sha: string
    }

const formatMessage = (
  m: Offense
): {
  message: string
  severity: 'message' | 'warn' | 'fail'
  url?: string
  ln?: number
} => {
  switch (m.type) {
    case OffenseType.BRANCH_FORMAT:
      return {
        message: `🌳 Branch name \`${m.branchName}\` does not follow the [format](${BRANCH_GUIDE}) \`{type}/{issue-id}-{feature-name}\`.`,
        severity: 'warn',
      }
    case OffenseType.BRANCH_TYPE:
      return {
        message: `🌳 Feature type\`${
          m.branchType
        }\` is not one of the [allowed types](${BRANCH_GUIDE}): ${branchTypes
          .map(t => `\`${t}\``)
          .join(', ')}.`,
        severity: 'warn',
      }
    case OffenseType.BRANCH_NOT_DELETED:
      return {
        message: '🗑️ Merging this MR will not delete the source branch.',
        severity: 'message',
      }
    case OffenseType.COMMIT_MISSING_TRACKER_REFERENCE:
      return {
        message: `🎫 Commit ${m.sha} does not have an [issue reference](${MSG_GUIDE}) for any issue.`,
        severity: 'message',
      }
    case OffenseType.COMMIT_BRANCH_TRACKER_REFERENCE_MISMATCH:
      return {
        message: `🎫 Commit ${
          m.sha
        } does not have an [issue reference](${MSG_GUIDE}) for the issue \`#${
          m.expectedReference
        }\` from source branch, found ${m.found
          .map(r => `\`#${r}\``)
          .join(', ')}.`,
        severity: 'message',
      }
    case OffenseType.COMMIT_MESSAGE_LENGTH:
      return {
        message: `💬 Commit ${m.sha} exceeds maximum length on first line ${
          m.length
        }/${50}.`,
        severity: 'warn',
      }
    case OffenseType.COMMIT_MESSAGE_FORMAT:
      return {
        message: `💬 Commit ${m.sha} has odd formatting. \n${m.diff}`,
        severity: 'warn',
      }
    case OffenseType.COMMIT_MESSAGE_INVALID_GITMOJI:
      return {
        message: `💬 Commit ${
          m.sha
        } does not seem to use [Gitmoji](${MSG_GUIDE}). Expected unicode emoji symbol, got \`${
          m.found
        }\` (\`${codes(m.found)}\`).`,
        severity: 'warn',
      }
    case OffenseType.CODE_TYPO: {
      const [first, ...rest] = m.typos
      const occurrence = `🔤 \`${first.text}\` might be a typo.`
      const reps = `Same word is repeated ${
        rest.length
      } more times in ${rest
        .map(t => `\`${t.uri ?? ''}:${t.row}\``)
        .join(', ')}`
      return {
        message: `${occurrence} ${rest.length > 0 ? reps : ''}`,
        severity: 'message',
        url: first.uri,
        ln: first.row,
      }
    }
    case OffenseType.COMMIT_MESSAGE_TYPO: {
      return {
        message: `🔤 \`${m.word}\` in ${m.sha}'s commit message might be a typo.`,
        severity: 'message',
      }
    }
    case OffenseType.COMMIT_INVALID_AUTHOR_EMAIL:
      return {
        message: `✉️ Commit ${m.sha} has a fishy email \`${
          m.found
        }\`. Does not [match](${COMMIT_GUIDE}) \`${
          (EMAIL_REG as unknown) as string
        }\`.`,
        severity: 'warn',
      }
    case OffenseType.COMMIT_FIXUP:
      return {
        message: `🚧 Commit ${m.sha} is a fixup, skipping checks.`,
        severity: 'message',
      }
    case OffenseType.COMMIT_MERGE:
      return {
        message: `🇾 Commit ${m.sha} is a merge, skipping checks. Seeing a merge commit in feature branch in feature branch is unusual and rebase should be preferred for the most cases.`,
        severity: 'message',
      }
    default:
      return {
        message: `MISSING MESSAGE FOR ${JSON.stringify(m)}!`,
        severity: 'fail',
      }
  }
}

interface Options {
  branchTrackerId?: string
  commitTrackerIds?: string[]
  gitmojis?: Gitmoji[]
  skipSha?: string[]
  skipRules?: Array<keyof typeof rules>
  validSpellingWords?: string[]
}
type Checker = (
  danger: Danger.DangerDSLType,
  options: Options
) => Offense[] | Promise<Offense[]>

const branchName: Checker = (danger, options) => {
  const sourceBranchName =
    danger.gitlab?.mr?.source_branch ?? danger.github?.pr?.head?.ref
  const [branchMatched, type, issueNumber] =
    sourceBranchName.match(/([a-z]+)\/([0-9]+)(.*)/) ?? []
  options.branchTrackerId = issueNumber
  if (!branchMatched) {
    return [{ branchName: sourceBranchName, type: OffenseType.BRANCH_FORMAT }]
  }
  if (!branchTypes.includes(type)) {
    return [{ branchType: type, type: OffenseType.BRANCH_TYPE }]
  }
  return []
}

const branchDeleted: Checker = (danger, options) => {
  if (danger.gitlab?.mr?.should_remove_source_branch) {
    return [{ type: OffenseType.BRANCH_NOT_DELETED }]
  }
  return []
}

const commitReferences: Checker = (danger, options) => {
  const offenses: Offense[] = []
  options.commitTrackerIds = options.commitTrackerIds ?? []
  danger.git.commits
    .filter(c => !options.skipSha?.includes(c.sha))
    .forEach(commit => {
      const commitsReferences = (
        commit.message.match(/(?:#)[0-9]+/g) ?? []
      ).map(x => x.substr(1))

      options.commitTrackerIds?.push(
        ...commitsReferences.filter(r => r !== options.branchTrackerId)
      )

      if (commitsReferences.length === 0) {
        return offenses.push({
          type: OffenseType.COMMIT_MISSING_TRACKER_REFERENCE,
          sha: commit.sha,
        })
      }
      if (
        options.branchTrackerId &&
        !commitsReferences.includes(options.branchTrackerId)
      ) {
        offenses.push({
          type: OffenseType.COMMIT_BRANCH_TRACKER_REFERENCE_MISMATCH,
          sha: commit.sha,
          expectedReference: options.branchTrackerId,
          found: commitsReferences,
        })
      }
    })
  options.commitTrackerIds = Array.from(new Set(options.commitTrackerIds))
  return offenses
}
const commitMessageFormat: Checker = (danger, options) => {
  const offenses: Offense[] = []
  danger.git.commits
    .filter(c => !options.skipSha?.includes(c.sha))
    .forEach(commit => {
      const commitHeader = commit.message.split('\n')[0]
      const [, symbol, title] = commitHeader.match(/^\s*(\S*)\s*(.*)$/) ?? []
      const usedGitmoji = options.gitmojis?.find(
        g => g.code === symbol || g.emoji === symbol
      )
      if (commitHeader.length > 50) {
        offenses.push({
          type: OffenseType.COMMIT_MESSAGE_LENGTH,
          sha: commit.sha,
          length: commitHeader.length,
        })
      }
      if (usedGitmoji) {
        const expectedMessage = `${usedGitmoji.emoji} ${capitalize(title)}`
        if (expectedMessage !== commitHeader) {
          const diff = `
\`\`\`diff
- ${commitHeader}
+ ${expectedMessage}${commit.message
            .substr(commitHeader.length)
            .replace(/\n/g, '\n  ')}
\`\`\`
`
          offenses.push({
            type: OffenseType.COMMIT_MESSAGE_FORMAT,
            sha: commit.sha,
            diff,
          })
        }
      } else {
        offenses.push({
          type: OffenseType.COMMIT_MESSAGE_INVALID_GITMOJI,
          sha: commit.sha,
          found: symbol,
        })
      }
    })
  return offenses
}

const commitEmail: Checker = (danger, options) => {
  const offenses: Offense[] = []
  danger.git.commits
    .filter(c => !options.skipSha?.includes(c.sha))
    .forEach(commit => {
      if (!commit.author.email.match(EMAIL_REG)) {
        offenses.push({
          type: OffenseType.COMMIT_INVALID_AUTHOR_EMAIL,
          sha: commit.sha,
          found: commit.author.email,
        })
      }
    })
  return offenses
}
const commitTypos: Checker = async (danger, options) => {
  const offenses: Offense[] = []
  for (const commit of danger.git.commits.filter(
    c => !options.skipSha?.includes(c.sha)
  )) {
    offenses.push(
      ...(
        await getTyposForText(
          commit.message,
          commit.sha,
          options.validSpellingWords
        )
      ).map(
        typo =>
          ({
            type: OffenseType.COMMIT_MESSAGE_TYPO,
            word: typo.text,
            sha: commit.sha,
          } as const)
      )
    )
  }
  return offenses
}

const commitFixupAndMerge: Checker = (danger, options) => {
  const offenses: Offense[] = []
  options.skipSha = options.skipSha ?? []
  danger.git.commits.forEach(commit => {
    if (commit.message.startsWith('fixup!')) {
      offenses.push({ type: OffenseType.COMMIT_FIXUP, sha: commit.sha })
    } else if (commit.message.startsWith('Merge')) {
      offenses.push({ type: OffenseType.COMMIT_MERGE, sha: commit.sha })
    } else {
      return
    }
    options.skipSha?.push(commit.sha)
  })
  return offenses
}

const codeTypos: Checker = async (danger, options) => {
  const codeTypos: TextDocumentOffset[] = []

  // Find and report code typos
  for (const filename of [
    ...danger.git.created_files,
    ...danger.git.modified_files,
  ]) {
    if (filename.match(/package-lock.json/)) {
      continue
    }
    const getChangedLines = async (filename: string) => {
      const structuredDiff = await danger.git.structuredDiffForFile(filename)
      const lines: number[] = []
      structuredDiff?.chunks.forEach(chunk => {
        lines.push(
          ...(chunk.changes as any[])
            .filter(change => change.type === 'add')
            .map(change => change.ln)
        )
      })
      return lines
    }
    const contents = readFileSync(absolutePath(filename), 'utf8')
    const lines = await getChangedLines(filename)
    codeTypos.push(
      ...(
        await getTyposForText(contents, filename, options.validSpellingWords)
      ).filter(typo => lines.includes(typo.row))
    )
  }
  return groupTypos(codeTypos).map(
    typos => ({ type: OffenseType.CODE_TYPO, typos } as const)
  )
}

const rules = {
  branchName,
  branchDeleted,
  commitFixupAndMerge,
  commitReferences,
  commitMessageFormat,
  commitEmail,
  commitTypos,
  codeTypos,
}

export const runDangerRules = async (
  { danger, warn, markdown, schedule, message }: typeof Danger,
  options: Options = {}
) => {
  const messages: Offense[] = []

  // Prepare gitmoji
  options.gitmojis = await getGitmoji()

  // Prepare spelling
  const dictionaryFiles = ['package-lock.json']
  options.validSpellingWords = options.validSpellingWords ?? []
  for (const file of dictionaryFiles) {
    if (!existsSync(absolutePath(file))) continue
    options.validSpellingWords.push(
      ...(readFileSync(absolutePath(file), 'utf8')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_/]/g, ' ')
        .match(/\w+/g) ?? [])
    )
  }

  // Run rules
  for (const [ruleName, rule] of Object.entries(rules)) {
    if (options.skipRules?.includes(ruleName as any)) continue
    messages.push(...(await rule(danger, options)))
  }

  if (options.branchTrackerId ?? (options.commitTrackerIds?.length ?? 0) > 0) {
    markdown(
      [
        '## 🎫 Redmine ticket',
        options?.branchTrackerId ? `Branch: #${options?.branchTrackerId}` : '',
        (options.commitTrackerIds?.length ?? 0) > 0
          ? `References from commits: ${
              options.commitTrackerIds?.map(r => `#${r}`).join(', ') ?? ''
            }`
          : '',
      ].join('\n')
    )
  }

  // Report offenses
  Object.values(OffenseType).map(type => {
    const currentMessages = messages.filter(m => m.type === type)
    if (currentMessages.length === 0) return
    if (currentMessages.every(m => 'sha' in m)) {
      const grouped = currentMessages.reduce(
        (acc: Record<string, Offense[]>, val: any) => {
          const { sha, ...dataWithoutSha } = val
          const key = JSON.stringify(dataWithoutSha)
          ;(acc[key] = acc[key] || []).push(val)
          return acc
        },
        {}
      )
      const condensedMsg = Object.values(grouped)
        .map(msgs => {
          const msg = formatMessage(msgs[0])
          if (msgs.length > 1) {
            return `${msg.message} Same issue in: ${msgs
              .slice(1)
              .map((m: any) => m.sha)
              .join(', ')}.`
          }
          return msg.message
        })
        .join('\n\n')
      ;({ fail, message, warn }[formatMessage(currentMessages[0]).severity](
        condensedMsg
      ))
    } else {
      currentMessages.map(formatMessage).forEach(msg => {
        ;({ fail, message, warn }[msg.severity](msg.message, msg.url, msg.ln))
      })
    }
  })
}
