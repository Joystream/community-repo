import db from './db'

async function main () {

    await db.sync({ force: true })
    console.log('DB created')

}

main()

