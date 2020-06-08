import {StatisticsCollector} from "./statistics";

const fs = require('fs').promises;

async function main() {
    const args = process.argv.slice(2);

    if (args.length != 2) {
        console.error('Usage: [start bock number] [end block number]');
        process.exit(1);
    }

    const startBlock = Number(args[0]);
    const endBlock = Number(args[1]);

    if (isNaN(startBlock) || isNaN(endBlock) || startBlock >= endBlock) {
        console.error('Invalid block range');
        process.exit(1);
    }

    try {
        let fileData = await fs.readFile(__dirname + '/../report-template.md', {
            encoding: "utf8"
        });
        console.log('Getting report info...');
        let statistics =  await StatisticsCollector.getStatistics(startBlock, endBlock);
        console.log('Writing info in the report...');

        let entries = Object.entries(statistics);

        for (let entry of entries){
            let regex = new RegExp('{' + entry[0] + '}', "g");
            fileData = fileData.replace(regex, entry[1].toString());
        }

        await fs.writeFile('report.md', fileData);
        console.log('Report generated!');
        process.exit(0);
    }catch (e) {
        console.error(e);
    }

}

main();