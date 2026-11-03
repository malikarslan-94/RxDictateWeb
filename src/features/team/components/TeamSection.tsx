import { StateMessage } from '@/components';
import {
  Avatar,
  Button,
  Icon,
  StatusChip,
  Table,
  TableHead,
  Td,
  TextLink,
  Th,
  Tr,
} from '@/ui';

import { teamCopy } from '../copy';
import { useTeam } from '../hooks/useTeam';
import { AssistantDialog } from './AssistantDialog';
import { MedicineManagerDialog } from './MedicineManagerDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';

/** Settings › Team: assistants and medicine managers, with Add, Edit and Remove. */
export function TeamSection() {
  const team = useTeam();
  const dialog = team.dialog;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-6">
        <p className="max-w-readable text-body text-ink-secondary">
          {teamCopy.subtitle}
        </p>
        <div className="flex shrink-0 gap-3">
          <Button
            label={teamCopy.addManager}
            variant="secondary"
            onClick={team.openAddManager}
          />
          <Button
            label={teamCopy.addAssistant}
            icon={<Icon name="plus" className="size-4" />}
            onClick={team.openAdd}
          />
        </div>
      </div>

      {team.rows.length > 0 ? (
        <Table>
          <TableHead>
            <Th>{teamCopy.columns.name}</Th>
            <Th>{teamCopy.columns.phone}</Th>
            <Th>{teamCopy.columns.worksAt}</Th>
            <Th />
          </TableHead>
          <tbody>
            {team.rows.map((row) => (
              <Tr key={row.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={row.name} tone="warm" />
                    <div>
                      <p className="font-bold">{row.name}</p>
                      <p className="text-meta text-ink-secondary">{row.role}</p>
                    </div>
                  </div>
                </Td>
                <Td>{row.phone}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {row.places.map((place) => (
                      <StatusChip key={place} label={place} tone="active" />
                    ))}
                  </div>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-5">
                    <TextLink
                      label={teamCopy.edit}
                      tone="muted"
                      onClick={() => team.openEdit(row.member)}
                    />
                    <TextLink
                      label={teamCopy.remove}
                      tone="danger"
                      onClick={() => team.openRemove(row.member)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <StateMessage
          isLoading={team.isLoading}
          error={team.error}
          onRetry={team.retry}
          empty={teamCopy.noAssistant}
        />
      )}

      <p className="flex items-center gap-3 rounded-card border border-dashed border-border px-5 py-4 text-body text-ink-secondary">
        <Icon name="users" className="size-4" />
        {teamCopy.secondDoctor}
      </p>

      {dialog?.kind === 'add' ? (
        <AssistantDialog member={null} onClose={team.closeDialog} />
      ) : null}
      {dialog?.kind === 'edit' ? (
        <AssistantDialog member={dialog.member} onClose={team.closeDialog} />
      ) : null}
      {dialog?.kind === 'addManager' ? (
        <MedicineManagerDialog member={null} onClose={team.closeDialog} />
      ) : null}
      {dialog?.kind === 'editManager' ? (
        <MedicineManagerDialog
          member={dialog.member}
          onClose={team.closeDialog}
        />
      ) : null}
      {dialog?.kind === 'remove' ? (
        <RemoveMemberDialog
          name={dialog.member.name}
          isRemoving={team.isRemoving}
          error={team.removeError}
          onRemove={() => team.remove(dialog.member)}
          onClose={team.closeDialog}
        />
      ) : null}
    </section>
  );
}
