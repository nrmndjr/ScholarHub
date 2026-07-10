import { Network } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function KnowledgeMapPage() {
  return (
    <ComingSoon
      icon={Network}
      title="Mapa do Conhecimento"
      description="A visualização em grafo conectando artigos, autores, projetos, tags e periódicos chega na próxima fase do ScholarHub."
    />
  );
}
