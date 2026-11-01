/** A form field's error line, under a control that draws none itself. */
export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-meta text-danger">{message}</p>
  ) : null;
}
