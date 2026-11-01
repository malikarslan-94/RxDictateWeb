import { FormInput, FormSegmented } from '@/components';
import { commonCopy } from '@/constants/copy';
import {
  Avatar,
  Banner,
  Button,
  Card,
  Icon,
  Kbd,
  PhoneInput,
  Spinner,
} from '@/ui';
import { cx } from '@/utils/classes';

import { receptionCopy } from '../copy';
import { useAddToList } from '../hooks/useAddToList';

const copy = receptionCopy.add;

/** Phone first: returning patients come up; anyone new is added in place. */
export function AddPatientPanel() {
  const panel = useAddToList();

  return (
    <Card className="flex flex-col gap-4" onKeyDown={panel.onKeyDown}>
      <div className="flex items-center justify-between">
        <h2 className="text-section">{panel.title}</h2>
        <Kbd keys={copy.shortcut} />
      </div>
      <PhoneInput
        ref={panel.phoneRef}
        label={copy.phone}
        hint={copy.phoneHint}
        value={panel.phone}
        onChange={panel.setPhone}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && panel.matches.length > 0) {
            event.preventDefault();
            panel.addChosen();
          }
        }}
      />
      {panel.notice ? <Banner tone="success">{panel.notice}</Banner> : null}
      {panel.isSearching ? (
        <div className="flex justify-center text-primary">
          <Spinner />
        </div>
      ) : null}

      {panel.matchesTitle ? (
        <div className="flex flex-col gap-2">
          <p className="text-label">{panel.matchesTitle}</p>
          {panel.matches.map((match) => (
            <button
              key={match.id}
              type="button"
              aria-pressed={match.isChosen}
              onClick={match.choose}
              className={cx(
                'flex items-center gap-3 rounded-card border px-4 py-3 text-left',
                match.isChosen
                  ? 'border-primary bg-primary-tint'
                  : 'border-border',
              )}
            >
              <Avatar name={match.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-bold">
                  {match.name}
                </span>
                <span className="block truncate text-meta text-ink-secondary">
                  {match.details}
                </span>
              </span>
              {match.isChosen ? (
                <Icon name="check" className="size-4 text-primary" />
              ) : null}
            </button>
          ))}
          {panel.chosenOnList !== null ? (
            <Banner tone="info">{copy.alreadyOn(panel.chosenOnList)}</Banner>
          ) : (
            <Button
              label={panel.addChosenLabel}
              fullWidth
              icon={<Icon name="plus" className="size-4" />}
              loading={panel.isSaving}
              onClick={panel.addChosen}
            />
          )}
          {panel.showSomeoneElse ? (
            <button
              type="button"
              onClick={panel.someoneElse}
              className="flex items-center gap-1 text-meta font-bold text-primary-strong hover:underline"
            >
              <Icon name="plus" className="size-3.5" />
              {copy.someoneElse}
            </button>
          ) : null}
        </div>
      ) : null}

      {panel.isAddingNew ? (
        <form
          onSubmit={panel.addNew}
          noValidate
          className="flex flex-col gap-4"
        >
          {panel.noOneNote ? (
            <p className="flex items-center gap-2 rounded-md bg-primary-tint px-4 py-3 text-meta">
              <Icon name="search" className="size-4" />
              {panel.noOneNote}
            </p>
          ) : null}
          <FormInput
            control={panel.control}
            name="name"
            label={copy.fullName}
            placeholder={copy.fullNamePlaceholder}
            autoFocus
          />
          <FormInput
            control={panel.control}
            name="age"
            label={copy.age}
            placeholder={copy.agePlaceholder}
            inputMode="numeric"
            maxLength={3}
            containerClassName="w-32"
          />
          <FormSegmented
            control={panel.control}
            name="sex"
            label={copy.sex}
            options={commonCopy.sexOptions}
          />
          <FormInput
            control={panel.control}
            name="reason"
            label={copy.reason}
            placeholder={copy.reasonPlaceholder}
          />
          <Button
            type="submit"
            label={panel.addNewLabel}
            fullWidth
            icon={<Icon name="plus" className="size-4" />}
            loading={panel.isSaving}
          />
          <p className="flex items-center justify-center gap-2 text-meta text-ink-secondary">
            <Kbd keys={copy.enter} /> {copy.enterAdds} · <Kbd keys={copy.esc} />{' '}
            {copy.escClears}
          </p>
        </form>
      ) : null}

      {panel.error ? <Banner tone="danger">{panel.error}</Banner> : null}
    </Card>
  );
}
