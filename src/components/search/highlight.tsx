import { Fragment } from 'react'

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Wraps matched search terms in <mark>. Works in server and client components. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const usable = terms.filter((term) => term.length > 1)
  if (!usable.length) return <>{text}</>
  const pattern = new RegExp(`(${usable.map(escape).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded-sm bg-butter px-0.5 text-on-fill">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  )
}
