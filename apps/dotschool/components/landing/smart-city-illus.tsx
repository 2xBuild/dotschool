import type { SVGProps } from "react";

const strokeClassName =
  "fill-none stroke-white/85 stroke-[3.5] [stroke-linecap:round] [stroke-linejoin:round]";

export function SmartCityIllus({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1200 260"
      className={className ? `block ${className}` : "block"}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet"
      {...props}
    >
      <g transform="translate(0 38)">
        <g className={`${strokeClassName} sm:hidden`}>
          <path d="M90 222V92L198 72V222" />
          <path d="M90 92L198 72" />
          <path d="M116 120H178" />
          <path d="M112 146H172" />

          <path d="M198 222V48L276 18V222" />
          <path d="M276 18L340 76V222" />
          <path d="M238 92L276 56" />

          <path d="M340 222V70L424 70V222" />
          <path d="M362 100V118" />
          <path d="M388 100V118" />
          <path d="M362 136V154" />
          <path d="M388 136V154" />

          <path d="M424 222L446 0H492L514 222" />
          <path d="M468 0V-24" />
          <path d="M456 50H500" />
          <path d="M452 84H504" />
          <path d="M448 118H508" />

          <path d="M514 222V62L594 42V222" />
          <path d="M594 42L650 34V222" />

          <path d="M650 222V74L718 26L772 92V222" />
          <path d="M718 26L772 92" />

          <path d="M772 222L794 10H850L872 222" />
          <path d="M790 54H854" />
          <path d="M786 88H858" />
          <path d="M782 124H862" />

          <path d="M872 222V72L942 52V222" />
          <path d="M942 52L996 46V222" />

          <path d="M996 222V84L1058 34V222" />
          <path d="M1058 34L1110 98V222" />
        </g>

        <g className={`${strokeClassName} hidden sm:block`}>
          <path d="M98 222V126L160 114V222" />
          <path d="M98 126L160 114" />
          <path d="M112 144H148" />
          <path d="M112 162H144" />

          <path d="M186 222V92L266 104V222" />
          <path d="M186 92L266 104" />
          <path d="M204 132H252" />
          <path d="M198 152H246" />
          <path d="M194 172H238" />

          <path d="M294 222V72L330 60V222" />
          <path d="M330 60L356 76V222" />
          <path d="M324 42V64" />

          <path d="M394 222V104L462 104V222" />
          <path d="M412 128V140" />
          <path d="M432 128V140" />
          <path d="M412 156V168" />
          <path d="M432 156V168" />

          <path d="M500 222V74L566 42V222" />
          <path d="M566 42L618 94V222" />
          <path d="M536 108L566 78" />

          <path d="M652 222L668 28H702L718 222" />
          <path d="M676 28V4" />
          <path d="M670 72H710" />
          <path d="M666 98H714" />
          <path d="M662 126H718" />

          <path d="M752 222V76L806 66V222" />
          <path d="M806 66L842 60V222" />

          <path d="M878 222L896 48H946L962 222" />
          <path d="M892 84H948" />
          <path d="M890 110H950" />
          <path d="M888 138H952" />

          <path d="M1002 222V104L1046 70L1088 112V222" />
          <path d="M1046 70L1088 112" />

          <path d="M1110 222V88L1160 78V222" />
        </g>
      </g>

    </svg>
  );
}
