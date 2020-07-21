const express = require('express');
const {getActiveSitesList, getSiteLevelBeforeJsData, getVariationsSiteData } = require('./repo');
const {generateVariationLevelJsReport, generateSiteLevelJsReport} = require('./generateReports');

const app = express();

app.post('/generateReports', async(req, res) => {

  const results = getActiveSitesList()
    .then(activeSitesYesterday => Promise.all(getSiteLevelBeforeJsData(activeSitesYesterday), getVariationsSiteData(activeSitesYesterday)))
    .then(([siteLevelData, variationLevelData]) => Promise.all(generateSiteLevelJsReport(siteLevelData), generateVariationLevelJsReport(variationLevelData)))
    .then(([siteReports, variationReports]) => {
      console.log({
        siteLen: siteReports.length,
        variationsLen: variationReports.length
      });
      return [...siteReports, ...variationReports];
    });

});

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

app.listen(4000, (req, res) => {
  console.log('Started listening on http://localhost:4000');
});