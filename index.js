const express = require('express');
const {getActiveSitesList, getSiteLevelBeforeJsData, getVariationsSiteData } = require('./repo');
const {generateVariationLevelJsReport, generateSiteLevelJsReport} = require('./generateReports');
const couchbaseService = require('./couchbase');
const config = require('./config');
const SpreadSheet = require('./SpreadSheet');

const app = express();

app.post('/generateReports', async(req, res) => {

  try {

    const activeSitesList = await getActiveSitesList();

    const siteLevelCbData = await getSiteLevelBeforeJsData(activeSitesList);
    const variationLevelCbData = await getVariationsSiteData(activeSitesList);

    const siteLevelReport = await generateSiteLevelJsReport(siteLevelCbData);
    const {
      nonUniqueAJsCount,
      nonUniqueBJsCount,
      results: variationLevelReport
    } = await generateVariationLevelJsReport(variationLevelCbData);

    const results = [...siteLevelReport, ...variationLevelReport];

    return res.json({
      data: results
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }

});

app.get('/activeSites', async (req, res) => {
  try {
    const results = await getActiveSitesList();
    return res.json(results);
  } catch(e) {
    console.error(e);
    return res.status(500).json({message: e.message || 'Error'});
  }
})

app.all('*', (req, res) => {
  return res.status(404).json({
    message: `Invalid route ${req.path}`
  });
});

process.on('unhandledRejection', () => {
  process.exit(1);
});

process.on('uncaughtException', () => {
  process.exit(1);
});

couchbaseService(config.COUCHBASE.host, config.COUCHBASE.bucket, config.COUCHBASE.username, config.COUCHBASE.password)
  .connect()
  .then(() => {
    app.listen(4000, (req, res) => {
      console.log('Started listening on http://localhost:4000');
    });
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  
