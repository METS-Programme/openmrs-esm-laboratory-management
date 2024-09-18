export function ClickElement(selector: any) {
  document.querySelectorAll(selector)?.forEach((p) => {
    p.click();
  });
}
