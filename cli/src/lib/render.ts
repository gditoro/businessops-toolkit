import Handlebars from "handlebars";

export function renderTemplate(templateContent: string, data: any): string {
  const template = Handlebars.compile(templateContent, { noEscape: true });
  return template(data);
}
