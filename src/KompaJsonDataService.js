var fetch = require('node-fetch');
var fs = require('fs');
var schedule = require('node-schedule');
var MailHelper = require('./MailHelper');

var TMP_FILE = "./tmp/data.tmp.json";
var REAL_FILE = "./public/data/data.json"; // Real public JSON file
var FLAG_FILE = "./tmp/flags.json"; // Nationtal flags maping file
var NAMEMAP_FILE = "./tmp/namemap.json"; // Source data <-> our application country name maping
var CRAWLER_DELAY = 5; // Start data synchronizing each 5 minutes

// You can have this configuration by chrome development tool
// Hope Kompa group will not change it after this post (*_*)
var baseUri = "https://corona-api.kompa.ai/graphql";
var fetchCountriesDataParam = {
    "credentials": "omit",
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "content-type": "application/json",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "origin": "https://corona.kompa.ai",
        "referrer": "https://corona.kompa.ai/",
        "referrerPolicy": "no-referrer-when-downgrade",
    },
    "body": "{\"operationName\":\"countries\",\"variables\":{},\"query\":\"query countries {\\n  countries {\\n    Country_Region\\n    Lat\\n    Long_\\n    Confirmed\\n    Deaths\\n    Recovered\\n    __typename\\n  }\\n  provinces {\\n    Province_Name\\n    Province_Id\\n    Lat\\n    Long\\n    Confirmed\\n    Deaths\\n    Recovered\\n    Last_Update\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors"
}

class KompaJsonDataService {

    constructor() {
        this.fetchData = this.fetchData.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    rebuildJsonDataFile(sourceJson) {
        var flags = JSON.parse(fs.readFileSync(FLAG_FILE).toString());
        var namemap = JSON.parse(fs.readFileSync(NAMEMAP_FILE).toString());

        var jsonData = {
            displayAds: false,
            worldMapUri: "",
            updatedAt: (new Date()).toUTCString(),
            total: 0,
            deaths: 0,
            recovered: 0
        };

        var total = 0;
        var deaths = 0;
        var recovered = 0;
        // Repair Vietnam data
        var ttVN = 0;
        var ttDVN = 0;
        var ttRVN = 0;
        sourceJson.provinces.forEach(pro => {
            ttVN += Number.parseInt(pro.Confirmed);
            ttDVN += Number.parseInt(pro.Deaths);
            ttRVN += Number.parseInt(pro.Recovered);
        });
        sourceJson.countries.some(oneCountry => {
            if (oneCountry.Country_Region === 'Vietnam') {
                oneCountry.Confirmed = ttVN;
                oneCountry.Deaths = ttDVN;
                oneCountry.Recovered = ttRVN;

                return true;
            }
        });
        
        sourceJson.countries.forEach(oneCountry => {
            total += Number.parseInt(oneCountry.Confirmed);
            deaths += Number.parseInt(oneCountry.Deaths);
            recovered += Number.parseInt(oneCountry.Recovered);
        });

        jsonData.countries = sourceJson.countries;
        jsonData.provinces = sourceJson.provinces;
        const cusSort = (el1, el2) => {
            return Number.parseInt(el2.Confirmed) - Number.parseInt(el1.Confirmed);
        };
        jsonData.countries.sort(cusSort);
        jsonData.provinces.sort(cusSort);
        // Move Others to the end
        let othersInd;
        let others;
        jsonData.countries.forEach((country, ind) => {
            if (country.Country_Region === 'Others') {
                othersInd = ind;
                others = country;
            }
        });
        delete jsonData.countries[othersInd];
        jsonData.countries.push(others);
        jsonData.countries = jsonData.countries.filter(val => val !== null);
        // Repair country name
        jsonData.countries.forEach(country => {
            if (namemap[country.Country_Region]) {
                country.Country_Region = namemap[country.Country_Region];
            }
        });
        jsonData.total = total;
        jsonData.deaths = deaths;
        jsonData.recovered = recovered;
        // Append more data
        jsonData.flags = flags;

        return jsonData;
    }

    async fetchData() {
        const fetchRt = await fetch(baseUri, fetchCountriesDataParam)
        const jsonData = await fetchRt.json()
        var countriesData = this.rebuildJsonDataFile(jsonData.data);

        console.logMsg(JSON.stringify(countriesData, null, 4));
        fs.writeFileSync(TMP_FILE, JSON.stringify(countriesData));
    }

    checkAndNotifyChangedData() {
        var tmpJsonData = JSON.parse(fs.readFileSync(TMP_FILE).toString());
        var oldJsonData = JSON.parse(fs.readFileSync(REAL_FILE).toString());

        let okToNotify = false;
        if (tmpJsonData.total > oldJsonData.total) okToNotify = true;
        if (!okToNotify &&
            tmpJsonData.total === oldJsonData.total &&
            tmpJsonData.recovered > oldJsonData.recovered) okToNotify = true;
        if (!okToNotify &&
            tmpJsonData.total === oldJsonData.total &&
            tmpJsonData.recovered === oldJsonData.recovered &&
            tmpJsonData.deaths > oldJsonData.deaths) okToNotify = true;
        
        if (!okToNotify) return;

        this.replaceJsonData();
        // Send mail to notify
        MailHelper.sendStatusChanged();
    }

    replaceJsonData() {
        const sourceJsonData = fs.readFileSync(TMP_FILE).toString();
        fs.writeFileSync(REAL_FILE, sourceJsonData);
    }

    getRealJsonData() {
        var realJsonData = JSON.parse(fs.readFileSync(REAL_FILE).toString());
        return realJsonData;
    }

    createCountinousEvent(onEvent) {
        if (!onEvent) {
            console.error("onEvent is not set!");
        }
        // Do a crawling when starting
        onEvent();
        const continousEventDelay = CRAWLER_DELAY; // x minutes
        let cronJob = "*/" + continousEventDelay + " * * * *";
        console.logMsg("createCountinousEvent => Creating job for: %s", cronJob);
        this.job = schedule.scheduleJob(cronJob, function () {
            console.logMsg("Event fired!");
            try {
                onEvent();
            } catch (err) {
                try {
                    MailHelper.sendCrawlError();
                } catch (err) {}
            }
        });
    }

    async onEvent() {
        await this.fetchData();
        this.checkAndNotifyChangedData();
    }

    start() {
        if (this.job) return;
        this.createCountinousEvent(this.onEvent);
    }

    stop() {
        if (this.job) this.job.cancel();
    }
}

var service = new KompaJsonDataService();
module.exports = service;
