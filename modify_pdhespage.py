import codecs
with codecs.open('app/src/pages/PdhesPage.tsx', 'r', 'utf-8') as f:
    content = f.read()
with codecs.open('cards.txt', 'r', 'utf-8') as f:
    cards = f.read().replace('ref={contentRef}', '').replace('<main className="content">', '<div className="pdhes-rich-shell"><div className="content">').replace('</main>', '</div></div>')

# Add FullscreenImageModal import
content = content.replace("import InfoAccordion from '../components/ui/InfoAccordion';", "import InfoAccordion from '../components/ui/InfoAccordion';
import FullscreenImageModal from '../components/ui/FullscreenImageModal';")

# Add modal state
state_injection = "  const { setPdhesContent } = useWorkspaceStore();
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const openModal = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };"
content = content.replace('  const { setPdhesContent } = useWorkspaceStore();', state_injection)

# Add modal JSX
modal_jsx = "{modalImage && (
        <FullscreenImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>"
content = content.replace('    </div>
  );
}', modal_jsx + '
  );
}')

# Replace FAQ section
start = content.find('<h2 id="sec-sss" style={{ marginTop: 32 }}>Sýk Sorulan Sorular</h2>')
end = content.find('</div>', start + 100) + 6
content = content[:start] + '<h2 id="sec-sss" style={{ marginTop: 32 }}>Sýk Sorulan Sorular</h2>
' + cards + content[end:]

with codecs.open('app/src/pages/PdhesPage.tsx', 'w', 'utf-8') as f:
    f.write(content)
