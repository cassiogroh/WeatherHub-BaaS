import { FiArrowDown, FiArrowUp, FiBarChart2, FiChevronDown, FiX } from "react-icons/fi";

import { SortDirection, SortOption, SortOptionGroup } from "../../utils/stationSorting";

import { Container } from "./styles";

interface SortStationsProps {
  groups: SortOptionGroup[];
  sortKey: string; // "" means no ranking
  direction: SortDirection;
  onChangeSortKey(sortKey: string): void;
  onToggleDirection(): void;
}

const renderOptions = (options: SortOption[]) => options.map(({ key, label }) => (
  <option key={key} value={key}>{label}</option>
));

const SortStations = ({ groups, sortKey, direction, onChangeSortKey, onToggleDirection }: SortStationsProps) => (
  <Container>
    <label title='Classificar todas as estações por um dado'>
      <FiBarChart2 size={18} />
      <p>Ranking</p>
      <select value={sortKey} onChange={event => onChangeSortKey(event.target.value)}>
        <option value='' disabled={!sortKey}>Escolha um dado</option>
        {groups.map(group => group.label
          ? <optgroup key={group.label} label={group.label}>{renderOptions(group.options)}</optgroup>
          : renderOptions(group.options),
        )}
      </select>
      <FiChevronDown size={16} />
    </label>

    {sortKey && (
      <>
        <button
          type='button'
          onClick={onToggleDirection}
          title={direction === "desc" ? "Maiores valores primeiro" : "Menores valores primeiro"}
        >
          {direction === "desc" ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
          <span>{direction === "desc" ? "Maior" : "Menor"}</span>
        </button>

        <button
          type='button'
          className='clear'
          onClick={() => onChangeSortKey("")}
          title='Limpar ranking'
          aria-label='Limpar ranking'
        >
          <FiX size={16} />
        </button>
      </>
    )}
  </Container>
);

export default SortStations;
