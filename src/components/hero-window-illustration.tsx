type Props = {
  className?: string;
};

export function HeroWindowIllustration({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 320 460"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="lineart-window" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="66" y="34" width="188" height="300" rx="7" />
        <rect x="78" y="46" width="164" height="276" rx="5" />

        <path d="M132.7 46v276" />
        <path d="M187.3 46v276" />
        <path d="M78 115h164" />
        <path d="M78 184h164" />
        <path d="M78 253h164" />

        <path d="M93 65l24 27" className="lineart-glint" />
        <path d="M148 142l19 22" className="lineart-glint lineart-glint--slow" />
        <path d="M196 210l24 26" className="lineart-glint" />
        <path d="M96 273l22 23" className="lineart-glint lineart-glint--slow" />
        <path d="M154 287l27 29" className="lineart-glint" />

        <path d="M66 334h188" />
        <path d="M52 334h216" />
        <path d="M52 334v18h216v-18" />
      </g>

      <g className="lineart-sky" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path
          className="lineart-moon"
          d="M210 76c-6 3-10 10-10 17 0 12 10 22 22 22 6 0 12-2 16-6-4 10-14 17-26 17-16 0-30-13-30-29 0-11 6-20 15-26 6-4 14-7 22-6-4 2-7 6-9 11Z"
        />

        <g className="lineart-star lineart-star--one">
          <path d="M103 78v10" />
          <path d="M98 83h10" />
        </g>
        <g className="lineart-star lineart-star--two">
          <path d="M160 92v8" />
          <path d="M156 96h8" />
        </g>
        <g className="lineart-star lineart-star--three">
          <path d="M221 146v10" />
          <path d="M216 151h10" />
        </g>
        <g className="lineart-star lineart-star--four">
          <path d="M110 165v9" />
          <path d="M105 169.5h10" />
        </g>
      </g>

      <g className="lineart-landscape" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M83 262c11-13 18-17 29-24 8 8 16 11 22 12 7-11 15-19 30-29 13 15 29 24 42 28 8-6 19-15 34-25" />
        <path d="M84 276c16-4 29-4 44 0 14 4 25 3 37 0 13-4 26-4 39 0 10 3 23 4 38 0" />
        <path d="M142 236h22l-2 20h-18v-20Z" />
        <path d="M145 244h16" />
        <path d="M210 243h28l2 18h-32l2-18Z" />
        <path d="M223 243v18" />
      </g>

      <g className="lineart-cat" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M122 334c-8 1-14 10-14 20 0 13 12 22 28 22s29-10 29-24c0-14-7-25-19-31" />
        <path d="M121 319 112 300l11 6 8-12 9 12 11-6-8 19" />
        <path d="M116 333c-10 16-9 39-1 57 8 17 10 25 8 35" />
        <path d="M149 334c13 14 17 33 12 54-3 13-2 22 4 33" />
        <path d="M128 427c5 8 4 18-2 24-6 6-15 4-18-2 6 1 10-1 12-7 2-5 2-10 8-15Z" />
        <path d="M132 345c6 4 12 4 18 0" />
      </g>

      <g className="lineart-cup" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M221 331h22l3 15h-28l3-15Z" />
        <path d="M246 336c4 0 7 3 7 7s-3 7-7 7" />
      </g>
    </svg>
  );
}
