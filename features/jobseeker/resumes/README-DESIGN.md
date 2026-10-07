# Modern resume builder component

This folder preserves the original Next.js, shadcn, Tailwind, resume storage, PDF, ATS, and AI contracts. Copy it back to `features/jobseeker/resumes` in the host application.

## Design requirements

The redesigned builder uses existing semantic theme utilities (`background`, `foreground`, `card`, `muted`, `primary`, `border`) so it inherits the host app theme. Printable resume accent colours remain data-driven by design.

Add these keyframes to the host application's global stylesheet if you want the subtle background motion:

```css
@keyframes resume-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-12deg);
  }
  50% {
    transform: translate3d(0, -14px, 0) rotate(-12deg);
  }
}
```

The builder remains fully usable without the optional animation.
