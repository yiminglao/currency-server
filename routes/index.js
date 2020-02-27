var express = require("express");
var router = express.Router();
var rp = require("request-promise");
let xmlParser = require("xml2json");

const currcencyXMLToJson = htmlString => {
  let result = xmlParser.toJson(htmlString, { reversible: true });
  const obj = JSON.parse(result);
  const currencyList = obj["gesmes:Envelope"]["Cube"]["Cube"]["Cube"];
  return currencyList;
};

/* post home page. */
router.get("/", function(req, res) {
  rp("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")
    .then(function(htmlString) {
      res.json(currcencyXMLToJson(htmlString));
    })
    .catch(function(err) {
      console.log(err);
    });
});

/* post home page. */
router.post("/getcurrency", function(req, res) {
  rp("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")
    .then(function(htmlString) {
      const targetCurrency = req.body.target_currency;
      const baseAmount = req.body.base_amount;
      const basetCurrency = req.body.base_currency;
      const currencyList = currcencyXMLToJson(htmlString);
      let targetRate = currencyList.find(x => x.currency == targetCurrency);
      let baseRate = currencyList.find(x => x.currency == basetCurrency);
      if (targetRate && baseRate) {
        const amount =
          Math.round((targetRate.rate / baseRate.rate) * baseAmount * 100) /
          100;
        targetRate = { ...targetRate, targetAmount: amount };
      }
      res.json(targetRate);
    })
    .catch(function(err) {
      console.log(err);
    });
});

module.exports = router;
