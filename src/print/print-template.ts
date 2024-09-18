import { PrintCss } from "./print-styles";
import { GetPrintLogo, PrintLogoData } from "../utils/image-utils";

export const GetPrintTemplate = (
  body: string,
  title: string | null | undefined,
  printOnLoad = false,
  closeAfterPrint = true
) => {
  return `<html>
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf8">
<title>${title ?? ""}</title>
<style>
${PrintCss}
</style>
${
  closeAfterPrint && printOnLoad
    ? `<script>  
  window.onfocus = function () { setTimeout(function () { window.close(); }, 500); }
</script>`
    : ""
}
</head>
<body onload="${
    printOnLoad ? "window.print()" : ""
  }" style='word-wrap:break-word'  ${
    closeAfterPrint ? 'onafterprint="self.close()"' : ""
  }>
    ${body}
</body>
</html>`;
};

export const GetLogoSection = async (
  printLogoUrl?: string,
  printLogoText?: string
) => {
  let printLogoData: PrintLogoData | null = null;
  if (printLogoUrl) {
    try {
      printLogoData = await GetPrintLogo(printLogoUrl);
    } catch (e) {}
  }
  return printLogoData || printLogoText
    ? `
<div class="logo" >
    ${
      printLogoData
        ? printLogoData.isSvg
          ? printLogoData.image
          : `<img alt='' src='${printLogoData.image}' />`
        : ""
    }
    ${
      printLogoText
        ? `<span class='logo-text text'>${printLogoText}</span>`
        : ""
    }
</div>    
    `
    : "";
};

export const GetHeaderSection = async (
  printLogoUrl?: string,
  printLogoText?: string,
  extraContent?: string
) => {
  let logoSection = await GetLogoSection(printLogoUrl, printLogoText);
  return `
<div class="header-row">
${logoSection}
${extraContent ?? ""}
</div>    
    `;
};

export const formatHealthCenterName = (healthCenterName: string) => {
  if (healthCenterName && healthCenterName.indexOf("\\n") > 0) {
    return `<div class="health-center text" style="text-align:right;">
    ${
      healthCenterName
        .split("\\n")
        .map((p, pIndex) =>
          p
            ? `<div style="font-size: ${pIndex == 0 ? 15 : 13}pt;">${p}</div>`
            : null
        )
        .filter((p) => p)
        .join("") ?? ""
    }
</div>`;
  }

  return `<div class="heading text center" style="text-transform: uppercase;font-size: 20pt;">
      <b>${healthCenterName ?? ""}</b>
  </div>`;
};
