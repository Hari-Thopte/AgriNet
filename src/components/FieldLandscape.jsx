import { useId } from 'react';

// A local, lightweight illustration: no image requests or animation loop.
export default function FieldLandscape({ className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`field-landscape ${className}`} viewBox="0 0 640 680" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#dfe8d1" /><stop offset="1" stopColor="#f3eacb" /></linearGradient>
        <linearGradient id={`${id}-field`} x2="1" y2="1"><stop stopColor="#59794a" /><stop offset="1" stopColor="#214d3b" /></linearGradient>
        <pattern id={`${id}-grain`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#fff" opacity=".12" /></pattern>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0h640v680H0z" />
      <circle cx="452" cy="139" r="65" fill="#f3c973" />
      <circle cx="452" cy="139" r="87" stroke="#fff" strokeOpacity=".3" />
      <path d="M0 274 94 206 171 245 287 182 403 265 512 211 640 258V440H0Z" fill="#adbea0" />
      <path d="M0 304Q123 244 264 284T640 279V480H0Z" fill="#829e76" />
      <path d="M0 337Q237 244 640 379V680H0Z" fill="#c3ba75" />
      <path d="M-40 362Q263 290 675 421M-40 378Q263 304 675 444M-40 394Q263 321 675 468M-40 412Q263 340 675 493" stroke="#e9dfa5" strokeWidth="3" opacity=".8" />
      <path d="M0 462C204 469 241 323 640 334V680H0Z" fill={`url(#${id}-field)`} />
      <g stroke="#91a968" strokeWidth="2.5" opacity=".7">
        <path d="M-20 492C213 487 247 350 660 354M-20 516C218 509 265 369 660 375M-20 545C222 537 290 387 660 397M-20 575C229 562 312 407 660 419M-20 608C241 587 331 429 660 443M-20 644C251 615 356 451 660 469M-20 680C256 646 379 476 660 497M20 711C287 672 398 502 660 525M93 723C327 683 423 529 660 555M170 730C373 687 447 557 660 586" />
      </g>
      <path d="M-20 608C230 600 302 514 367 482C445 443 530 465 660 527V704H-20Z" fill="#d6b76b" />
      <g stroke="#f3dfa2" strokeWidth="3" opacity=".65"><path d="M-10 639C237 628 310 539 379 511S544 496 660 552M-10 664C247 654 324 565 394 539S552 529 660 584M-10 690C261 681 340 593 410 567S566 562 660 615M79 705C288 703 359 623 433 598S577 594 660 647" /></g>
      <path d="M278 680C363 612 427 579 459 521S443 426 402 402" stroke="#f3e7c3" strokeWidth="13" />
      <g fill="#234d3b"><path d="M106 328v-63h5v63z" /><ellipse cx="108" cy="262" rx="18" ry="32" /><path d="M139 320v-44h4v44z" /><ellipse cx="141" cy="272" rx="13" ry="24" /><path d="M522 350v-53h5v53z" /><ellipse cx="524" cy="291" rx="19" ry="34" /></g>
      <path d="M352 337h49v37h-49z" fill="#f1e8ca" /><path d="m344 338 32-26 33 26z" fill="#8e6349" /><path d="M369 351h13v23h-13z" fill="#53715b" />
      <path d="m151 135 8-4 8 4m21 17 6-3 6 3m-61 14 5-3 5 3" stroke="#53715b" strokeWidth="2" strokeLinecap="round" />
      <path fill={`url(#${id}-grain)`} d="M0 0h640v680H0z" />
    </svg>
  );
}
