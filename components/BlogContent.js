import Link from 'next/link';

export default function BlogContent({ content }) {
  return <div className="blog-body">{content.map((block, index) => {
    if (typeof block === 'string') return block.split(/\n\s*\n/).map((paragraph, part) => <p key={`${index}-${part}`} style={{whiteSpace:'pre-line'}}>{paragraph}</p>);
    if (block.type === 'heading') {
      const Heading = block.level === 3 ? 'h3' : 'h2';
      return <Heading key={index} style={{marginTop:'1.6em',marginBottom:'.6em'}}>{block.text}</Heading>;
    }
    if (block.type === 'list') {
      const List = block.ordered ? 'ol' : 'ul';
      return <List key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</List>;
    }
    if (block.type === 'paragraph' && Array.isArray(block.children)) return <p key={index}>{block.children.map((part, partIndex) => part.href ? (part.href.startsWith('/') ? <Link className="internal-link" key={partIndex} href={part.href}>{part.text}</Link> : <a key={partIndex} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>) : <span key={partIndex}>{part.text}</span>)}</p>;
    return <p key={index} style={{whiteSpace:'pre-line'}}>{block.text}</p>;
  })}</div>;
}
