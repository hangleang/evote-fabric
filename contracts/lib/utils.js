class Utils {
  static async getAsset(ctx, assetId) {
    const isExists = await Utils.isAssetExists(ctx, assetId);

    if (!isExists) {
      return {
        "error": `The asset with assetID ${assetId} does not exist on earth.`
      }
    }

    const assetAsBytes = await ctx.stub.getState(assetId);
    return JSON.parse(assetAsBytes.toString());
  }

  static async isAssetExists(ctx, assetId) {
    const assetAsBytes = await ctx.stub.getState(assetId);
    return (!!assetAsBytes && assetAsBytes.length > 0);
  }

  static async queryWithQueryString(ctx, qs) {
    console.log("Query string", JSON.stringify(qs));

    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    let allResults = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify(allResults);
      }
    }
  }
}

module.exports = Utils;