import { Mascot } from 'page-mascot';

export function MoaazMascot({
  size = 140,
  label = 'Moaaz avatar',
}: {
  size?: number;
  label?: string;
}) {
  return (
    <Mascot
      directions="/mascots/moaaz-clean-directions.webp"
      reactions="/mascots/moaaz-clean-reactions.webp"
      size={size}
      label={label}
    />
  );
}
