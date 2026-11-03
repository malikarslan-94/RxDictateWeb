import { Segmented } from '@/ui';

import { useMedicineLists } from '../hooks/useMedicineLists';
import { DrugListSection } from './DrugListSection';

/** The lists this person keeps, one at a time. */
export function MedicineLists() {
  const lists = useMedicineLists();

  return (
    <div className="flex flex-col gap-4">
      {lists.hasOwnList ? (
        <div>
          <Segmented
            label={lists.label}
            options={lists.options}
            value={lists.owner}
            onChange={lists.choose}
          />
        </div>
      ) : null}
      {/* Keyed, so a list's search and page don't carry over to the other. */}
      <DrugListSection key={lists.owner} owner={lists.owner} />
    </div>
  );
}
