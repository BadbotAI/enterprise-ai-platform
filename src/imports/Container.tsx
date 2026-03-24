import svgPaths from "./svg-coi3qon8ev";

function Icon() {
  return (
    <div className="absolute h-[40px] left-0 top-[60px] w-[60px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 40">
        <g id="Icon">
          <path d="M0 20H60" id="Vector" stroke="var(--stroke-0, #3B82F6)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[28px] relative shrink-0 w-[72px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] top-0 tracking-[-0.4395px]">需求分析</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <path d={svgPaths.pb60700} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-25%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
            <path d="M1 3L3 5L7 1" id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[28px] relative shrink-0 w-[288px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Heading />
        <Container4 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-0 top-[1.5px] w-[70px]" data-name="Text">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold','Noto_Sans_SC:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] tracking-[-0.1504px]">任务描述：</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[36.5px] left-[70px] top-[1.5px] w-[280px]" data-name="Text">
      <p className="absolute css-4hzbpn font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[-1px] tracking-[-0.1504px] w-[280px]">理解并分析用户需求，提取关键信息</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-0 top-[1.5px] w-[70px]" data-name="Text">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold','Noto_Sans_SC:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] tracking-[-0.1504px]">任务目标：</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[70px] top-[1.5px] w-[210px]" data-name="Text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] tracking-[-0.1504px]">明确用户需求，确保项目方向正确</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Text2 />
      <Text3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[288px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container6 />
        <Container7 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[16px] h-[160px] items-start left-[60px] pb-[22px] pl-[26px] pr-[2px] pt-[26px] rounded-[16px] top-0 w-[340px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
      <Container3 />
      <Container5 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[160px] left-0 top-0 w-[400px]" data-name="Container">
      <Icon />
      <Container2 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute h-[20px] left-[169px] top-0 w-[2px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 20">
        <g clipPath="url(#clip0_21_1676)" id="Icon">
          <path d="M1 0V20" id="Vector" stroke="var(--stroke-0, #CBD5E1)" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_21_1676">
            <rect fill="white" height="20" width="2" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M10 6.66667V3.33333H6.66667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p34a15680} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M1.66667 11.6667H3.33333" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M16.6667 11.6667H18.3333" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M12.5 10.8333V12.5" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M7.5 10.8333V12.5" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[#364153] relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-[98px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.5px] tracking-[-0.1504px]">需求分析智能体</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="bg-[#dbeafe] h-[20px] relative rounded-[16777200px] shrink-0 w-[60.945px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#1447e6] text-[12px] top-[3px]">单agent</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Text4 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] top-px">专注于用户需求分析和提取</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="flex-[1_0_0] h-[38px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container13 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[56px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[12px] items-start pb-0 pt-[8px] px-[8px] relative size-full">
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#f3f4f6] content-stretch flex flex-col h-[76px] items-start left-0 pb-[2px] pt-[10px] px-[10px] rounded-[14px] top-[20px] w-[340px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <Container10 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[96px] left-[60px] top-[160px] w-[340px]" data-name="Container">
      <Icon2 />
      <Container9 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <Container1 />
      <Container8 />
    </div>
  );
}