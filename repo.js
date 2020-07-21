const sql = require('mssql');
const {couchbaseService} = require('node-utils');
const config = require('./config');

const getActiveSitesList = async () => {
  const yesterdaysDate = getYesterdaysDate();
  const query = `SELECT UNIQUE siteid FROM SiteNetworkDailyReport WHERE report_date = @yesterdaysDate`;

  const pool = await sql.connect(config.SQL_CREDS);
  const sitesList = await pool.request()
    .input('yesterdaysDate', sql.VarChar ,yesterdaysDate)
    .query(query);
  return sitesList;
}

const getVariationsSiteData = async (sitesList =[]) => {
  const query = `SELECT DISTINCT siteId, variations, pageGroup, platform from AppBucket WHERE META().id like "chnl::%" AND siteId IN ${JSON.stringify(sitesList)}`;
  return couchbaseService(...config.COUCHBASE_CREDS)
    .queryDB(query)
    .then(res =>  res.AppBucket);
}

const getSiteLevelBeforeJsData = async (sitesList = []) => {
  const query = `SELECT DISTINCT siteId, apConfigs.beforeJs from AppBucket WHERE META().id like "site::%" AND apConfigs.beforeJs IS NOT NULL AND apConfigs.beforeJs != "" AND siteId IN ${JSON.stringify(sitesList)}`;
  return couchbaseService(...config.COUCHBASE_CREDS)
    .queryDB(query)
    .then(res => res.AppBucket)
}

const getYesterdaysDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

module.exports = {
  getActiveSitesList,
  getVariationsSiteData,
  getSiteLevelBeforeJsData
}