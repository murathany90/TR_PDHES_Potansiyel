import { useEffect, useState } from 'react';

interface Section {
  id: string;
  title: string;
}

export default function SectionNav({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>('.panel.active');

    const handleScroll = () => {
      const panelIsScrollable = Boolean(panel && panel.scrollHeight > panel.clientHeight + 1);
      const scrollPosition = (panelIsScrollable ? panel!.scrollTop : window.scrollY) + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveId(sections[i].id);
          break;
        }
      }
    };

    panel?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      panel?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  return (
    <nav className="section-nav" aria-label="Bu sayfadaki bölümler">
      <ul className="section-nav-list">
        {sections.map((sec) => (
          <li key={sec.id}>
            <a
              href={`#/pdhes/${sec.id}`}
              className={activeId === sec.id ? 'active' : ''}
            >
              {sec.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
