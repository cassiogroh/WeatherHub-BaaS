import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FormatDateProps {
  date: string;
  formatQuery: string;
}

export function formatDate ({ date, formatQuery }: FormatDateProps) {
  return format(
    new Date(date),
    formatQuery,
    { locale: ptBR },
  )
}
