import inquirer from 'inquirer';

import { syncBrCosmeticSeries } from './br-item-series';
import {
    syncBrCosmeticTypes,
    syncFestivalCosmeticTypes
} from './cosmetic-item-type';
import { syncCrewRewardItems } from './crew-reward-items';

const main = async () => {
    const { generateOptions } = await inquirer.prompt([
        {
            type: 'list',
            name: 'generateOptions',
            message: 'Which data would you like to generate?',
            choices: [
                { name: 'BR Cosmetic Item Type', value: 'br_item_type' },
                { name: 'Festival Cosmetic Item Type', value: 'festival_item_type' },
                new inquirer.Separator(),
                { name: 'BR Cosmetic Series', value: 'br_item_series' },
                new inquirer.Separator(),
                { name: 'Fortnite Crew Rewards', value: 'crew_rewards' },
                new inquirer.Separator(),
                { name: 'Quit', value: 'quit' }
            ]
        }
    ]);

    switch (generateOptions) {
        case 'br_item_type':
            await syncBrCosmeticTypes();
            break;
        case 'festival_item_type':
            await syncFestivalCosmeticTypes();
            break;
        case 'br_item_series':
            await syncBrCosmeticSeries();
            break;
        case 'crew_rewards':
            await syncCrewRewardItems();
            break;
        case 'quit':
            return;
    }
};

main()
    .catch(e => {
        console.error('An error occured while running this CLI');
        process.exit(1);
    })
    .finally(() => {
        console.log('CLI Process Completed.');
        process.exit(1);
    });