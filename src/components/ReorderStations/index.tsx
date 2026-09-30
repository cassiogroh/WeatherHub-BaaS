import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2 } from "react-icons/fi";

import { User } from "../../models/user";
import { constants } from "../../utils/constants";

import { Container, PageGroup, Grid, Card } from "./styles";

type Station = User["wuStations"][number];

interface SortableStationProps {
  station: Station;
  position: number;
  onDelete(stationId: string): void;
}

// Keeps presses on the delete button from starting a drag of the card
const stopDrag = (event: React.SyntheticEvent) => event.stopPropagation();

const SortableStation = ({ station, position, onDelete }: SortableStationProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: station.id });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      isDragging={isDragging}
      title={`${station.name} (${station.id})`}
      {...attributes}
      {...listeners}
    >
      <div>
        <strong>{position}</strong>
        <small>{station.id}</small>
        <button
          type='button'
          title='Remover estação'
          aria-label={`Remover estação ${station.name}`}
          onClick={() => onDelete(station.id)}
          onMouseDown={stopDrag}
          onTouchStart={stopDrag}
          onKeyDown={stopDrag}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
      <span>{station.name}</span>
    </Card>
  );
};

interface ReorderStationsProps {
  stations: Station[]; // sorted by order
  onReorder(stationsIds: string[]): void;
  onDelete(stationId: string): void;
}

const ReorderStations = ({ stations, onReorder, onDelete }: ReorderStationsProps) => {
  const [dragPreview, setDragPreview] = useState<{ activeId: string; overId: string } | null>(null);

  // Mouse drags after moving 5px; touch needs a short press so the page can still scroll
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const stationsIds = useMemo(() => stations.map(station => station.id), [stations]);

  // Same split as the dashboard pages
  const pages = useMemo(() => {
    const { pageSize } = constants;

    return Array.from({ length: Math.ceil(stations.length / pageSize) }, (_, page) => ({
      page,
      first: page * pageSize + 1,
      stations: stations.slice(page * pageSize, (page + 1) * pageSize),
    }));
  }, [stations]);

  // Order the cards would have if dropped now, so the numbers update while dragging
  const previewIds = useMemo(() => {
    if (!dragPreview) return stationsIds;

    return arrayMove(stationsIds, stationsIds.indexOf(dragPreview.activeId), stationsIds.indexOf(dragPreview.overId));
  }, [dragPreview, stationsIds]);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    setDragPreview(over ? { activeId: String(active.id), overId: String(over.id) } : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragPreview(null);

    if (!over || active.id === over.id) return;

    onReorder(arrayMove(stationsIds, stationsIds.indexOf(String(active.id)), stationsIds.indexOf(String(over.id))));
  };

  return (
    <Container>
      <p>Arraste as estações para mudar a ordem. As alterações são salvas automaticamente.</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragPreview(null)}
      >
        {/* A single sortable list across all page groups, so stations can move between pages */}
        <SortableContext items={stationsIds} strategy={rectSortingStrategy}>
          {pages.map(({ page, first, stations: pageStations }) => (
            <PageGroup key={page}>
              <header>
                <strong>Página {page + 1}</strong>
                <span>
                  {pageStations.length > 1
                    ? `Estações ${first}–${first + pageStations.length - 1}`
                    : `Estação ${first}`}
                </span>
              </header>

              <Grid>
                {pageStations.map(station => (
                  <SortableStation
                    key={station.id}
                    station={station}
                    position={previewIds.indexOf(station.id) + 1}
                    onDelete={onDelete}
                  />
                ))}
              </Grid>
            </PageGroup>
          ))}
        </SortableContext>
      </DndContext>
    </Container>
  );
};

export default ReorderStations;
