import { Module } from '@nuxt/types';
import { IContent } from '@/composables/stores/Article';
import { pathToSlug } from '../composables/utils/ConvertArticlePath';
import { $content } from '@nuxt/content';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { OverlayOptions } from 'sharp';
import TextToSVG from 'text-to-svg';
import { GenerationOptions } from 'text-to-svg';
import imageminPngquant from 'imagemin-pngquant';

// [私は型情報を書くのをサボりました] の札
const TinySeqmenter = require('tiny-segmenter');

export interface GeneratorOutputs {
  nameTemplate: string;
  path: string;
}

export interface GeneratorResources {
  baseImagePath: string;
  fontPath: string;
}

type VerticalAlignment = 'top' | 'bottom' | 'middle';
type HorizonalAlignment = 'left' | 'center' | 'right';

type Anchor = `${HorizonalAlignment} ${VerticalAlignment}`;
type TextAlignment = 'left' | 'right' | 'center';

function SplitToAlignments(anchor: Anchor): [HorizonalAlignment, VerticalAlignment]{
    return anchor.split(' ') as [HorizonalAlignment, VerticalAlignment];
}

export interface TextsStyle {
  textOptions?: GenerationOptions;
  textAlign?: TextAlignment;
  lineSpacing?: number;
  width?: number;
  anchor?: Anchor;
  position(imageSize: Vector2D): Vector2D;
}

const defaultTextStyle: TextsStyle = {
  textOptions: {
    fontSize: 50,
    attributes: { fill: 'black' }
  },
  textAlign: 'left',
  lineSpacing: 10,
  width: 900,
  anchor: 'left top',
  position: () => [0, 0]
};

export interface GeneratorConfig {
  output: GeneratorOutputs;
  resources: GeneratorResources;
  textStyle: TextsStyle;
  contentPath: string;
  contentQuery?: object;
}

type AdjastedTexts = string[];
type Vector2D = [number, number]; // W : H

interface SVGData {
  text: string;
  svg: string;
  size: Vector2D;
}

interface TitleSVGSet {
  title: string;
  slug: string;
  svgs: SVGData[];
}

interface PngBuffer {
  filename: string;
  buffer: Buffer;
}

interface Options {
    config: GeneratorConfig
}

function RenderText(textToSVG: TextToSVG, text: string, config: GeneratorConfig): SVGData {
  const options: GenerationOptions =
      config.textStyle.textOptions === undefined ? defaultTextStyle.textOptions! :
          config.textStyle.textOptions!;

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

function AdjustTexts(textToSVG: TextToSVG, segmentedTexts: string[], config: GeneratorConfig): AdjastedTexts {
  const options = config.textStyle.textOptions;
  const boxWidth = config.textStyle.width === undefined ? defaultTextStyle.width! : config.textStyle.width!;

  let result: string[] = [];
  let textBuffer = '';
  for (const seg of segmentedTexts) {
    const beforeText = textBuffer;
    textBuffer += seg;
    const { width } = textToSVG.getMetrics(textBuffer, options);
    if (boxWidth < width) {
      result.push(beforeText);
      textBuffer = seg;
    }
  }
  if (textBuffer !== '') {
    result.push(textBuffer);
  }
  return result;
}

type BoxAlignmentCalculator = (size: number) => number ;
const HAlignmentCalculatorMap: Map<HorizonalAlignment, BoxAlignmentCalculator> = new Map([
    ['left', () => 0],
    ['center', (size: number) => -size / 2],
    ['right', (size: number) => -size]
]);
const VAlignmentCalculatorMap: Map<VerticalAlignment, BoxAlignmentCalculator> = new Map([
    ['top', () => 0],
    ['middle', (size: number) => -size / 2],
    ['bottom', (size: number) => -size]
]);

type TextAlignmentCalculator = (textWidth: number, config: GeneratorConfig) => number;
const TextAlignmentCalculatorMap: Map<TextAlignment, TextAlignmentCalculator>  = new Map([
    ['left', () => 0],
    ['right', (textWidth: number, config: GeneratorConfig) =>
        config.textStyle.width === undefined ? defaultTextStyle.width! :
            config.textStyle.width! - textWidth],
    ['center', (textWidth: number, config: GeneratorConfig) =>
        (config.textStyle.width === undefined ? defaultTextStyle.width! :
             config.textStyle.width! - textWidth) / 2]
]);

function compositeImage(svgSet: TitleSVGSet, config: GeneratorConfig): Promise<PngBuffer> {
  // FIXME: マジックナンバーじゃなくする
  const baseImageW = 1200;
  const baseImageH = 630;
  const textStyle = config.textStyle === undefined ? defaultTextStyle : config.textStyle!;
  const lineSpacing = textStyle.lineSpacing === undefined ?
      defaultTextStyle.lineSpacing! : textStyle.lineSpacing!;
  const anchor = textStyle.anchor === undefined ? defaultTextStyle.anchor! : textStyle.anchor!;
  const boxWidth = textStyle.anchor === undefined ? defaultTextStyle.width! : textStyle.width!;
  const textAlign = textStyle.textAlign === undefined ? defaultTextStyle.textAlign! : textStyle.textAlign!;

  const lineNums = svgSet.svgs.length;
  const lineHeightSample = svgSet.svgs[0].size[1];
  const totalHeight = (lineNums - 1) * lineSpacing + lineNums * lineHeightSample;

  // const verticalOffset =
  //   (((lineNums - 1) * config.textStyle.lineSpacing + lineNums * lineHeightSample) / 2 -
  //     lineHeightSample / 2) *
  //   (lineNums === 1 ? 0 : 1);
  const [ hAlign, vAlign ] = SplitToAlignments(anchor);
  const textBoxOffset: Vector2D = [
      HAlignmentCalculatorMap.get(hAlign)!(boxWidth),
      VAlignmentCalculatorMap.get(vAlign)!(totalHeight)];

  const options: OverlayOptions[] = svgSet.svgs.map((svg, idx) => {
    const { position } = config.textStyle;
    const pos = position([baseImageW, baseImageH]);
    const textOffset = TextAlignmentCalculatorMap
                    .get(textAlign)!(svg.size[0], config);
    return {
      input: Buffer.from(svg.svg),
      top: Math.floor(pos[1] + idx * (lineHeightSample + lineSpacing) + textBoxOffset[1]),
      left: Math.floor(pos[0] + textOffset + textBoxOffset[0])
    };
  });

  const buffer = (async (): Promise<PngBuffer> => {
    const { nameTemplate } = config.output;
    const { baseImagePath } = config.resources;
    return {
      filename: nameTemplate.replace('%s', svgSet.slug),
      buffer: await sharp(baseImagePath)
        .composite(options)
        .png()
        .toBuffer()
    };
  })();

  return buffer;
}

async function WritePngWithOptimization(pngBuffer: PngBuffer, config: GeneratorConfig) {
  const optimizedPngBuffer = await imageminPngquant({
    speed: 1,
    quality: [0.8, 0.9]
  })(pngBuffer.buffer);

  fs.mkdirSync(path.resolve(config.output.path), { recursive: true });
  fs.writeFile(path.resolve(path.join(config.output.path, pngBuffer.filename)), optimizedPngBuffer, err => {
    if (err) throw err;
  });
}

// function WritePng(pngBuffer: PngBuffer) {
//   fs.writeFile(pngBuffer.filePath, pngBuffer.buffer, err => {
//     if (err) throw err;
//   });
// }

function OverwriteConfig(config: GeneratorConfig) {
    config.textStyle.textOptions = config.textStyle.textOptions === undefined
        ? defaultTextStyle.textOptions! : config.textStyle.textOptions!;
    config.textStyle.textOptions.anchor = "left top";
}

const OgpImageGeneratorModule: Module<Options> = function(moduleOptions) {
  const config = moduleOptions.config;
  OverwriteConfig(config);
  const textToSVG = TextToSVG.loadSync(config.resources.fontPath);

  const { nuxt } = this;

  nuxt.hook('generate:before', async () => {
    const contents = config.contentQuery === undefined ?
        (await $content(config.contentPath, { deep: true }).fetch()) as IContent[] :
        (await $content(config.contentPath, { deep: true }).where(config.contentQuery).fetch()) as IContent[];


    const titles = contents.map(content => content.title);
    const slugs = contents.map(content => pathToSlug(content.path, 'articles'));
    const segmentedTexts = titles.map(title => SegmentText(title));
    const adjustedTexts = segmentedTexts.map(segs => AdjustTexts(textToSVG, segs, config));
    const svgs: TitleSVGSet[] = adjustedTexts.map((texts, idx) => {
      return {
        title: titles[idx],
        slug: slugs[idx],
        svgs: texts.map(text => RenderText(textToSVG, text, config))
      };
    });

    const pngBuffers = await Promise.all(
      svgs.map(svgSet => compositeImage(svgSet, config))
    );

    pngBuffers.map(async buf => await WritePngWithOptimization(buf, config));
    // pngBuffers.map(buf => WritePng(buf));
  });
};

export default OgpImageGeneratorModule;
