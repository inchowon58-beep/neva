import { BUSINESS_INFO } from "@/lib/constants";

type SiteBusinessFooterProps = {
  variant?: "light" | "dark";
};

export default function SiteBusinessFooter({ variant = "light" }: SiteBusinessFooterProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`space-y-1.5 text-sm ${isDark ? "text-[#a89888]" : "text-slate-600"}`}
    >
      <p className={`font-medium ${isDark ? "text-[#c4a574]" : "text-slate-800"}`}>
        {BUSINESS_INFO.companyName}
      </p>
      <p>법인등록번호 {BUSINESS_INFO.corpRegistration}</p>
      <p>대표 {BUSINESS_INFO.representative}</p>
      <p>{BUSINESS_INFO.address}</p>
      <p>
        <a
          href={BUSINESS_INFO.mainSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline-offset-2 hover:underline ${
            isDark ? "text-[#c4a574] hover:text-[#d4b584]" : "text-blue-600 hover:text-blue-700"
          }`}
        >
          {BUSINESS_INFO.mainSiteUrl}
        </a>
      </p>
      <p className={`pt-1 text-xs ${isDark ? "uppercase tracking-widest text-[#8a7a6a]" : "text-slate-500"}`}>
        © {BUSINESS_INFO.copyrightYear} All Rights Reserved.
      </p>
    </div>
  );
}
