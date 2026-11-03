import { useState } from 'react';
import { useParams } from 'react-router';

import { portalCopy } from '../copy';

const copy = portalCopy.invitePage;

/**
 * What an invite's SMS opens. It asks the server nothing: a code can only be
 * checked by someone signed in, in the app, with the matching phone.
 */
export function useInvitePage() {
  const { code = '' } = useParams<{ code: string }>();
  const [isCopied, setIsCopied] = useState(false);

  return {
    code,
    copyLabel: isCopied ? copy.copied : copy.copy,
    copyCode: async () => {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    },
  };
}
