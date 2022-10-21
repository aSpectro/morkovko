import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from './../entities/player.entity';
import { PlayerDTO } from './../dto/player.dto';

import { randomIntFromInterval } from 'src/morkovko/commands/helpers';
import { Mutations } from 'src/enums';

interface Dir {
  name: string;
  size: number;
  parts: Array<{ name: string; }>;
};

const dirs: Dir[] = [
  {
    name: 'carrot',
    size: 256,
    parts: [
      { name: 'backgrounds' },
      { name: 'body' },
      { name: 'buscket' },
      { name: 'dots' },
      { name: 'pattern' },
      { name: 'top' }
    ]
  },
  {
    name: 'pumpkin',
    size: 512,
    parts: [
      { name: 'backgrounds' },
      { name: 'body' }
    ]
  }
];

const absolutePath = './layers';

@Injectable()
export class MutatorService {
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>
  ) {}

  public mutate() {
    return new Promise((resolve) => {
      let i = 0;
      const init = async (index) => {
        await this.createImages(dirs[index]);
        i += 1;
        if (i < dirs.length) {
          setTimeout(() => {
            init(i);
          }, 1000);
        } else {
          console.log('Все изображения сгенерированы!');
          resolve(true);
        }
      }

      init(0);
    })
  }

  private createImages(veg: Dir) {
    return new Promise((resolve) => {
      let imagesCount = 0;
      const dirs = veg.parts

      const canvas = createCanvas(veg.size, veg.size);
      const ctx = canvas.getContext('2d');

      const getDirLayers = (dir: string) => {
        return fs
          .readdirSync(`${absolutePath}/${veg.name}/${dir}/`)
          .map((value) => {
            return value;
          });
      };

      const getAllCombinations = (mutations: { name: string; layers: string[] }[]) => {
        const combine = (...args) => {
          let r = [], max = args.length - 1;
          const helper = (arr, i) => {
            for (let j = 0, l = args[i].length; j < l; j++) {
              let a = arr.slice(0);
              a.push(args[i][j]);
              if (i==max)
                r.push(a);
              else
                helper(a, i + 1);
            }
          }
          helper([], 0);
          return r;
        };
        return combine(...mutations.map(m => m.layers.map(k => ({ mutation: m.name, layer: k }))));
      };

      const generateImage = (index: number, combination: { mutation: string; layer: string; }[]) => {
        return new Promise(async (resolve) => {
          for (let i = 0; i < combination.length; i++) {
            const val = combination[i];
            const image = await loadImage(
              `${absolutePath}/${veg.name}/${val.mutation}/${val.layer}`,
            );
            ctx.drawImage(image, 0, 0, veg.size, veg.size);
          }
  
          console.log(`Прогресс (${veg.name}): ${index + 1} / ${imagesCount}`);
          fs.writeFileSync(
            `./outputs/${veg.name}/${index + 1}.png`,
            canvas.toBuffer('image/png'),
          );
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          resolve(true)
        })
      };

      const allMutations = dirs.map((m) => ({ ...m, layers: getDirLayers(m.name) }));
      const combinations = getAllCombinations(allMutations);
      imagesCount = combinations.length;

      let j = 0;
      const generate = async (index) => {
        await generateImage(index, combinations[index]);
        j += 1;
        if (j < combinations.length) {
          setTimeout(() => {
            generate(j);
          }, 10);
        } else {
          resolve(true);
        }
      };
      generate(j);
    });
  }

  public async updateUsers() {
    try {
      const data: PlayerDTO[] = await this.playerRepository.find();

      const getRandomAvatar = (mutation: Mutations) => {
        const num = randomIntFromInterval(1, fs.readdirSync(`./outputs/${mutation}`).length);
        const veg = mutation;
        return `./outputs/${veg}/${num}.png`;
      }

      for (const player of data) {
        player.carrotAvatar = getRandomAvatar(Mutations.carrot);
        player.pumpkinAvatar = getRandomAvatar(Mutations.pumpkin);
        await this.savePlayer(player);
      }
    } catch (error) {
      console.log(error);
    }
  }

  savePlayer(player: PlayerDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const playerRow: PlayerDTO = player;
        await this.playerRepository.save(playerRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }
}
