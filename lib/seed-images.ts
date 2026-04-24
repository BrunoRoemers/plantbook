import arugulaPronto from '@/content/people/bruno/seeds/arugula-pronto.png'
import arugulaSpeedy from '@/content/people/bruno/seeds/arugula-speedy.png'
import basil from '@/content/people/bruno/seeds/basil.png'
import blackCherryTomato from '@/content/people/bruno/seeds/black-cherry-tomato.png'
import brusselsSproutsCyrus from '@/content/people/bruno/seeds/brussels-sprouts-cyrus.png'
import brusselsSproutsSteadia from '@/content/people/bruno/seeds/brussels-sprouts-steadia.png'
import carrotNantes from '@/content/people/bruno/seeds/carrot-nantes.png'
import coriander from '@/content/people/bruno/seeds/coriander.png'
import dill from '@/content/people/bruno/seeds/dill.png'
import hotPepper from '@/content/people/bruno/seeds/hot-pepper.png'
import leafLettuce from '@/content/people/bruno/seeds/leaf-lettuce.png'
import marigold from '@/content/people/bruno/seeds/marigold.png'
import nasturtium from '@/content/people/bruno/seeds/nasturtium.png'
import parsley from '@/content/people/bruno/seeds/parsley.png'
import redCherryTomato from '@/content/people/bruno/seeds/red-cherry-tomato.png'
import scallion from '@/content/people/bruno/seeds/scallion.png'
import spinach from '@/content/people/bruno/seeds/spinach.png'
import yellowBushBeans from '@/content/people/bruno/seeds/yellow-bush-beans.png'
import yellowCherryTomato from '@/content/people/bruno/seeds/yellow-cherry-tomato.png'
import type { StaticImageData } from 'next/image'

const SEED_IMAGES: Record<string, StaticImageData> = {
  'arugula-pronto': arugulaPronto,
  'arugula-speedy': arugulaSpeedy,
  basil,
  'black-cherry-tomato': blackCherryTomato,
  'brussels-sprouts-cyrus': brusselsSproutsCyrus,
  'brussels-sprouts-steadia': brusselsSproutsSteadia,
  'carrot-nantes': carrotNantes,
  coriander,
  dill,
  'hot-pepper': hotPepper,
  'leaf-lettuce': leafLettuce,
  marigold,
  nasturtium,
  parsley,
  'red-cherry-tomato': redCherryTomato,
  scallion,
  spinach,
  'yellow-bush-beans': yellowBushBeans,
  'yellow-cherry-tomato': yellowCherryTomato,
}

export function getSeedImage(slug: string): StaticImageData | null {
  return SEED_IMAGES[slug] ?? null
}
