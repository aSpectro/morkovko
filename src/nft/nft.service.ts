import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

const imageFormat = {
  width: 256,
  height: 256,
};

const dir = {
  traitTypes: `./layers/trait_types`,
  outputs: `./outputs`,
  background: `./layers/background`,
};

@Injectable()
export class NFTService {
  totalOutputs = 0;

  public createImages() {
    const canvas = createCanvas(imageFormat.width, imageFormat.height);
    const ctx = canvas.getContext('2d');

    const priorities = ['buscket', 'body', 'top', 'dots', 'pattern'];

    const main = async (numberOfOutputs) => {
      const traitTypesDir = dir.traitTypes;
      // register all the traits
      const types = fs.readdirSync(traitTypesDir);

      // set all priotized layers to be drawn first. for eg: punk type, top... You can set these values in the priorities array in line 21
      const traitTypes = priorities
        .concat(types.filter((x) => !priorities.includes(x)))
        .map((traitType) =>
          fs
            .readdirSync(`${traitTypesDir}/${traitType}/`)
            .map((value) => {
              return { trait_type: traitType, value: value };
            })
            .concat({ trait_type: traitType, value: 'N/A' }),
        );

      const backgrounds = fs.readdirSync(dir.background);

      // trait type avail for each punk
      const combinations = allPossibleCases(traitTypes, numberOfOutputs);

      for (let n = 0; n < combinations.length; n++) {
        const randomBackground =
          backgrounds[Math.floor(Math.random() * backgrounds.length)];
        await drawImage(combinations[n], randomBackground, n);
      }
    };

    const recreateOutputsDir = () => {
      if (fs.existsSync(dir.outputs)) {
        fs.rmdirSync(dir.outputs, { recursive: true });
      }
      fs.mkdirSync(dir.outputs);
      fs.mkdirSync(`${dir.outputs}/metadata`);
      fs.mkdirSync(`${dir.outputs}/carrots`);
    };

    const allPossibleCases = (arraysToCombine, max) => {
      const divisors = [];
      let permsCount = 1;

      for (let i = arraysToCombine.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1]
          ? divisors[i + 1] * arraysToCombine[i + 1].length
          : 1;
        permsCount *= arraysToCombine[i].length || 1;
      }

      if (!!max && max > 0) {
        console.log(max);
        permsCount = max;
      }

      this.totalOutputs = permsCount;

      const getCombination = (n, arrays, divisors) =>
        arrays.reduce((acc, arr, i) => {
          acc.push(arr[Math.floor(n / divisors[i]) % arr.length]);
          return acc;
        }, []);

      const combinations = [];
      for (let i = 0; i < permsCount; i++) {
        combinations.push(getCombination(i, arraysToCombine, divisors));
      }

      return combinations;

      return [];
    };

    const drawImage = async (traitTypes, background, index) => {
      // draw background
      const backgroundIm = await loadImage(`${dir.background}/${background}`);

      ctx.drawImage(backgroundIm, 0, 0, imageFormat.width, imageFormat.height);

      //'N/A': means that this punk doesn't have this trait type
      const drawableTraits = traitTypes.filter((x) => x.value !== 'N/A');
      for (let index = 0; index < drawableTraits.length; index++) {
        const val = drawableTraits[index];
        const image = await loadImage(
          `${dir.traitTypes}/${val.trait_type}/${val.value}`,
        );
        ctx.drawImage(image, 0, 0, imageFormat.width, imageFormat.height);
      }

      console.log(`Progress: ${index + 1}/ ${this.totalOutputs}`);

      //deep copy
      const metaDrawableTraits = JSON.parse(JSON.stringify(drawableTraits));

      //remove .png from attributes
      metaDrawableTraits.map((x) => {
        x.value = x.value.substring(0, x.value.length - 4);
        return x;
      });

      // save metadata
      fs.writeFileSync(
        `${dir.outputs}/metadata/${index + 1}.json`,
        JSON.stringify(
          {
            name: `carrot ${index}`,
            description: 'nft carrot',
            image: `ipfs://NewUriToReplace/${index}.png`,
            attributes: metaDrawableTraits,
          },
          null,
          2,
        ),
      );

      // save image
      fs.writeFileSync(
        `${dir.outputs}/carrots/${index + 1}.png`,
        canvas.toBuffer('image/png'),
      );
    };

    recreateOutputsDir();
    main(false);
  }
}
