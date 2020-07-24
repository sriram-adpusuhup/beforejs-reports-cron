const atob = require('atob');

const generateVariationLevelJsReport = (siteVariationsData = []) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const cache = {};
    let nonUniqueAJsCount = 0;
    let nonUniqueBJsCount = 0;
  
    for (let site of siteVariationsData) {
      if (!site.variations) continue;
  
      const variations = Object.values(site.variations);
      for (let variation of variations) {
        if (!variation.customJs) continue;
        if (!cache[site.siteId]) {
          cache[site.siteId] = {
            beforeJs: new Set(),
            afterJs: new Set(),
          };
        }
  
        const data = {
          siteid: site.siteId,
          pageGroup: site.pageGroup,
          platform: site.platform,
          variationId: variation.id,
          variationName: variation.name,
          beforeJs: "",
          afterJs: "",
        };
        let isChanged = false;
  
        if (variation.customJs.beforeAp) {
          const beforeJs = atob(variation.customJs.beforeAp);
          if (
            beforeJs.length !== 0 &&
            !cache[site.siteId].beforeJs.has(beforeJs)
          ) {
            data.beforeJs = beforeJs;
            isChanged = true;
            cache[site.siteId].beforeJs.add(beforeJs);
          } else {
            if (beforeJs.length !== 0) {
              nonUniqueBJsCount++;
            }
          }
        }
  
        if (variation.customJs.afterAp) {
          const afterJs = atob(variation.customJs.afterAp);
          if (afterJs.length !== 0 && !cache[site.siteId].afterJs.has(afterJs)) {
            data.afterJs = afterJs;
            isChanged = true;
            cache[site.siteId].afterJs.add(afterJs);
          } else {
            if (afterJs.length !== 0) {
              nonUniqueAJsCount++;
            }
          }
        }
  
        if (isChanged) results.push(data);
      }
    }

    console.log({nonUniqueAJsCount, nonUniqueBJsCount});
  
    resolve({
      results,
      nonUniqueAJsCount,
      nonUniqueBJsCount
    });
  })
};

const generateSiteLevelJsReport = (sitesData = []) => {
  return new Promise((resolve, reject) => {
    const results = sitesData.filter(site => !!site.beforeJs)
    .map(site => ({
      siteId: site.siteId,
      pageGroup: 'N/A',
      platform: 'N/A',
      variationId: 'N/A',
      variationName: 'N/A',
      beforeJs: atob(site.beforeJs),
      afterJs: 'N/A'
    }));
    resolve(results);
  })
}

module.exports = {
  generateSiteLevelJsReport,
  generateVariationLevelJsReport
}


