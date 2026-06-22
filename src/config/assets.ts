const SVG = "/SVG";

export const DESKTOP_ASSETS = {
  homeScene: `${SVG}/homescreen background.svg`,
  folder: `${SVG}/folder_icon.svg`,
  book: `${SVG}/book_icon.svg`,
  mail: `${SVG}/mail_icon.svg`,
  fileCode: `${SVG}/file_code_icon.svg`,
  fileNormal: `${SVG}/file_normal_icon.svg`,
  calculator: `${SVG}/calculator_icon.svg`,
  fileImage: `${SVG}/file_img_icon.svg`,
  trash: `${SVG}/trash_icon.svg`,
  characterCoding: `${SVG}/character_coding.svg`,
} as const;

export function isSvgAsset(path: string): boolean {
  return path.startsWith("/") && path.endsWith(".svg");
}
