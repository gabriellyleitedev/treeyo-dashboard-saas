// Placeholder para telas que ainda não foram construídas
interface EmBreveProps {
  titulo: string;
}

export default function EmBreve({ titulo }: EmBreveProps) {
  return <div className="text-white p-10">{`Página ${titulo} em breve...`}</div>;
}
