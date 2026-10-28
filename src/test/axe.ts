import axe from "axe-core";

/** Run axe on the current document. Colour contrast needs a real browser, so it is skipped here. */
export async function violations(container: Element = document.body) {
  const res = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return res.violations.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}
