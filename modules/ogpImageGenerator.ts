import { Module } from "@nuxt/types";
import { IContent } from "@/composables/stores/Article";
import { $content } from "@nuxt/content";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { OverlayOptions } from "sharp";
import TextToSVG from "text-to-svg";
import { GenerationOptions } from "text-to-svg";
import imageminPngquant from "imagemin-pngquant";

// [私は型情報を書くのをサボりました] の札
const TinySeqmenter = require("tiny-segmenter");

interface GeneratorConfig {
  ogpImageDir: string;
  baseImagePath: string;
  fontPath: string;
  textColor: string;
  maxWidth: number;
  lineSpacing: number;
  fontSize: number;
  textOffset: [number, number];
}

type AdjastedTexts = string[];
interface SVGData {
  text: string;
  svg: string;
  size: [number, number];
}
interface TitleSVGSet {
  title: string;
  svgs: SVGData[];
}

interface PngBuffer {
  filePath: string;
  buffer: Buffer;
}

const generatorConfig: GeneratorConfig = {
  ogpImageDir: path.join(process.cwd(), "/static/images/ogp/"),
  get baseImagePath() {
    return path.join(this.ogpImageDir, "article_base.png");
  },
  fontPath: path.join(process.cwd(), "/assets/fonts/", "MPLUS1p-ExtraBold.ttf"),
  textColor: "#37424e",
  maxWidth: 900,
  lineSpacing: 10,
  fontSize: 50,
  textOffset: [0, -90]
};

const textToSVG = TextToSVG.loadSync(generatorConfig.fontPath);

interface Options {}

function RenderText(text: string, config: GeneratorConfig): SVGData {
  const options: GenerationOptions = {
    x: 0,
    y: 0,
    anchor: "left top",
    fontSize: config.fontSize,
    attributes: { fill: config.textColor, stores: config.textColor }
  };

  const { width, height } = textToSVG.getMetrics(text, options);
  return {
    text: text,
    svg: textToSVG.getSVG(text, options),
    size: [width, height]
  };
}

function SegmentText(text: string): string[] {
  const segmenter = new TinySeqmenter();
  const segs = segmenter.segment(text) as string[];
  return segs;
}

function AdjustTexts(
  segmentedTexts: string[],
  config: GeneratorConfig
): AdjastedTexts {
  const options = {
    x: 0,
    y: 0,
    anchor: "left top",
    fontSize: config.fontSize
  } as GenerationOptions;

  let result: string[] = [];
  let textBuffer = "";
  for (const seg of segmentedTexts) {
    const beforeText = textBuffer;
    textBuffer += seg;
    const { width } = textToSVG.getMetrics(textBuffer, options);
    if (config.maxWidth < width) {
      result.push(beforeText);
      textBuffer = seg;
    }
  }
  if (textBuffer !== "") {
    result.push(textBuffer);
  }
  return result;
}

function compositeImage(
  svgSet: TitleSVGSet,
  config: GeneratorConfig
): Promise<PngBuffer> {
  // FIXME: マジックナンバーじゃなくする
  const baseImageW = 1200;
  const baseImageH = 630;

  const lineNums = svgSet.svgs.length;
  // FIXME: 完全に正確ではない可能性がある
  const lineHeightSample = svgSet.svgs[0].size[1];
  const verticalOffset =
    (((lineNums - 1) * config.lineSpacing + lineNums * lineHeightSample) / 2 -
      lineHeightSample / 2) *
    (lineNums === 1 ? 0 : 1);

  const commonCalc = (imageSize: number, svgSize: number, offset: number) => {
    return imageSize / 2 - svgSize / 2 + offset;
  };
  const options: OverlayOptions[] = svgSet.svgs.map((svg, idx) => {
    return {
      input: Buffer.from(svg.svg),
      top: Math.floor(
        commonCalc(baseImageH, svg.size[1], config.textOffset[1]) +
          idx * (lineHeightSample + config.lineSpacing) -
          verticalOffset
      ),
      left: Math.floor(
        commonCalc(baseImageW, svg.size[0], config.textOffset[0])
      )
    };
  });

  const buffer = (async (): Promise<PngBuffer> => {
    return {
      filePath: path.join(
        generatorConfig.ogpImageDir,
        `articles/${svgSet.title}.png`
      ),
      buffer: await sharp(generatorConfig.baseImagePath)
        .composite(options)
        .png()
        .toBuffer()
    };
  })();

  return buffer;
}

async function WritePngWithOptimization(pngBuffer: PngBuffer) {
  const optimizedPngBuffer = await imageminPngquant({
    speed: 1,
    quality: [0.8, 0.0]
  })(pngBuffer.buffer);

  fs.writeFile(pngBuffer.filePath, optimizedPngBuffer, err => {
    if (err) throw err;
  });
}

function WritePng(pngBuffer: PngBuffer) {
    fs.writeFile(pngBuffer.filePath, pngBuffer.buffer, err => {
      if (err) throw err;
    });
}

const OgpImageGeneratorModule: Module<Options> = function() {
  const { nuxt } = this;

  nuxt.hook("generate:before", async () => {
    const contents = (await $content("articles").fetch()) as IContent[];

    const titles = contents.map(content => content.title);
    const segmentedTexts = titles.map(title => SegmentText(title));
    const adjustedTexts = segmentedTexts.map(segs =>
      AdjustTexts(segs, generatorConfig)
    );
    const svgs: TitleSVGSet[] = adjustedTexts.map((texts, idx) => {
      return {
        title: titles[idx],
        svgs: texts.map(text => RenderText(text, generatorConfig))
      };
    });

    const pngBuffers = await Promise.all(
      svgs.map(svgSet => compositeImage(svgSet, generatorConfig))
    );

    // pngBuffers.map(async buf => await WritePngWithOptimization(buf));
    pngBuffers.map(buf => WritePng(buf));
  });
};

export default OgpImageGeneratorModule;
