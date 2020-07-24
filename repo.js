const sql = require('mssql');
const couchbaseService = require('./couchbase');
const config = require('./config');

const getActiveSitesList = async () => {
  const yesterdaysDate = getYesterdaysDate();
  const query = `SELECT DISTINCT siteid FROM SiteNetworkDailyReport WHERE report_date = @yesterdaysDate`;

  const pool = await sql.connect(config.SQL_CREDS);
  const result = await pool.request()
    .input('yesterdaysDate', sql.VarChar ,yesterdaysDate)
    .query(query);
  const sitesList = result.recordset.map(res => res.siteid);
  return sitesList;
}

const getVariationsSiteData = async (sitesList =[]) => {
  const query = `SELECT DISTINCT siteId, variations, pageGroup, platform from AppBucket WHERE META().id like "chnl::%" AND siteId IN ${JSON.stringify(sitesList)}`;
  return couchbaseService(config.COUCHBASE.host, config.COUCHBASE.bucket, config.COUCHBASE.username, config.COUCHBASE.password)
    .queryDB(query);
}

const getSiteLevelBeforeJsData = async (sitesList = []) => {
  const query = `SELECT DISTINCT siteId, apConfigs.beforeJs from AppBucket WHERE META().id like "site::%" AND apConfigs.beforeJs IS NOT NULL AND apConfigs.beforeJs != "" AND siteId IN ${JSON.stringify(sitesList)}`;
  return couchbaseService(config.COUCHBASE.host, config.COUCHBASE.bucket, config.COUCHBASE.username, config.COUCHBASE.password)
    .queryDB(query);
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