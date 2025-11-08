import inquirer from 'inquirer';
import { execSync } from 'child_process';

const main = async () => {
    const { actionOpts } = await inquirer.prompt([
        {
            type: 'list',
            name: 'actionOpts',
            message: 'What would you like to do?',
            choices: [
                { name: 'Generate Migration', value: 'generate' },
                { name: 'Migration', value: 'migrate' },
                new inquirer.Separator(),
                { name: 'Quit', value: 'quit' },
            ],
        },
    ]);

    if (actionOpts === 'quit') return;

    const { envOption } = await inquirer.prompt([
        {
            type: 'list',
            name: 'envOption',
            message: 'Which environment would you like to generate migrate for?',
            choices: [
                { name: 'Production', value: 'prod' },
                { name: 'Staging', value: 'staging' },
                new inquirer.Separator(),
                { name: 'Quit', value: 'quit' },
            ],
        },
    ]);

    if (envOption === 'quit') return;

    if (actionOpts === 'generate') {
        const { generateName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'generateName',
                required: true,
                message: 'Enter migration name:'
            },
        ]);

        const cmd = `npx drizzle-kit generate --name=${generateName} --config=drizzle-${envOption}.config.ts`;

        console.log(`Generating Migration File for ${envOption}`);

        execSync(cmd, { stdio: 'inherit' });
        return;
    };

    if (actionOpts === 'migrate') {
        const cmd = `npx drizzle-kit migrate --config=drizzle-${envOption}.config.ts`;

        console.log(`Migrating  for ${envOption}`);

        execSync(cmd, { stdio: 'inherit' });
        return;
    };
};

main();