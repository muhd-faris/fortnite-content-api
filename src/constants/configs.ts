import brCosmeticTypesData from '../data/cosmetic_br_types.json';
import festivalCosmeticTypesData from '../data/cosmetic_festival_types.json';
import brSeriesData from '../data/cosmetic_br_series.json';

export const FortniteComBaseUrl: string = 'https://fortnite-api.com';

export const SupportedLanguage = [
    { display_name: 'Arabic', value: 'ar' },
    { display_name: 'German', value: 'de' },
    { display_name: 'English', value: 'en' },
    { display_name: 'Spanish', value: 'es' },
    { display_name: 'French', value: 'fr' },
    { display_name: 'Italian', value: 'it' },
    { display_name: 'Japanese', value: 'ja' },
    { display_name: 'Korean', value: 'ko' },
    { display_name: 'Polish', value: 'pl' },
    { display_name: 'Russian', value: 'ru' },
    { display_name: 'Turkish', value: 'tr' },
    { display_name: 'Simplified Chinese', value: 'zh-Hans' },
    { display_name: 'Portuguese (Brazil)', value: 'pt-BR' }
].sort((a, b) => a.display_name.localeCompare(b.display_name));

export const UnsupportedBrTypes: string[] = [
    'BannerToken',
    'AthenaEmoji',
    'AthenaLoadingScreen',
    'AthenaPetCarrier',
    'AthenaPet',
    'AthenaSpray',
    'AthenaToy'
];

export const SupportedBrItemTypesVal: string[] = brCosmeticTypesData.map(t => t.value);

export const SupportedBrItemSeriesVal: string[] = brSeriesData.map(s => s.backend_value);

export const SupportedItemTypesVal: string[] = [
    'all',
    ...SupportedBrItemTypesVal,
    ...festivalCosmeticTypesData.map(t => t.value)
];
