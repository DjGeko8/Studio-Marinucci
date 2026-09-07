import type { MDXComponents } from 'mdx/types'

/**
 * Mappatura degli elementi MDX sui componenti del design system.
 * Gli articoli in `content/news/*.mdx` sono già racchiusi in <Prose>, che si occupa
 * della spaziatura: qui restano solo gli elementi che meritano un trattamento proprio.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2 {...props} className="mt-12 text-title-md text-ink">
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className="mt-9 text-title-sm text-ink">
        {children}
      </h3>
    ),
    a: ({ children, href, ...props }) => {
      const esterno = typeof href === 'string' && /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          {...props}
          {...(esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="link"
        >
          {children}
        </a>
      )
    },
    ...components,
  }
}
