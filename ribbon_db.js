
const mysql = require("mysql2")
const util = require("util")

require('dotenv').config()


const mypool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

// login
const getShareCount = () => {
    query = util.promisify(mypool.query).bind(mypool);
    return query(`SELECT sum(count) as count FROM tbl_sharecounts;`)
}

const getLuckyDrawCount = () => {
    query = util.promisify(mypool.query).bind(mypool);
    return query(`SELECT count FROM tbl_luckydrawcounts WHERE  date =  CURDATE();`)
}

const saveLuckyDrawCount = () => {
    query = util.promisify(mypool.query).bind(mypool);
    return query(`call ncisskdp_ribbon.sp_saveLuckyDraw();`);
}

const saveShareCount = () => {
    query = util.promisify(mypool.query).bind(mypool);
    return query(`call ncisskdp_ribbon.sp_saveShareCount();`);
}

module.exports = {saveShareCount, getShareCount, getLuckyDrawCount, saveLuckyDrawCount}