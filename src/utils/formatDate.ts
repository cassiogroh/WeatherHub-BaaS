import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FormatDateProps {
  date: string | number | null;
  formatQuery: string;
}

export function formatDate ({ date, formatQuery }: FormatDateProps) {
  if (!date) return "";

  return format(
    new Date(date),
    formatQuery,
    { locale: ptBR },
  );
}
