import { ImageSourcePropType } from 'react-native';

export interface SubTopic {
  id: string;
  title: string;
  images: ImageSourcePropType[];
}

export interface Topic {
  id: string;
  title: string;
  subtopics: SubTopic[];
  images: ImageSourcePropType[];
}

export const brochureData: Topic[] = [
  {
    id: '1',
    title: 'Veeneer Door',
    subtopics: [
      {
        id: '1-1',
        title: 'D1 - VENEER DOOR (10FT)',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0141.jpg' },
        ],
      },
      {
        id: '1-2',
        title: 'D5 - VENEER DOOR (10FT)',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0604.jpg' },
        ],
      },
    ],
    images: [
      { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0141.jpg' },
      { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0604.jpg' },
    ],
  },

  {
    id: '2',
    title: 'LAMELLA DOOR',
    subtopics: [
      {
        id: '2-1',
        title: 'D2 - LAMELLA DOOR (10FT)',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
        ],
      },
      {
        id: '3-1',
        title: 'D3 - LAMELLA DOOR',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
        ],
      },
      {
        id: '4-1',
        title: 'D4 - LAMELLA DOOR (10FT)',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
        ],
      },
    ],
    images: [
      { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
    ],
  },

  {
    id: '3',
    title: 'PAINT DOOR',
    subtopics: [
      {
        id: '3-1',
        title: 'FDC-FD-PAINT-13',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
        ],
      },
      {
        id: '3-2',
        title: 'FDC-FD-PAINT-13 B',
        images: [
          { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0618.jpg' },
        ],
      },
    ],
    images: [
      { uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0564.jpg' },
      // require('../assets/door/SNPT0604.jpg'),
    ],
  },
];
