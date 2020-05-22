
// system
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

// Selenium
const {Capabilities,Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const drv_folder= "Drivers/";
const drv_name = "chromedriver_"

run();

async function run (){

    //variables
    const GUID_List = './GUID list.txt';
    var by =  By.css("#hplogo");
    var robots = [];

    //Setup
    {
        // Load driver
        loadChromedriver()

        // variable
        var chromeCapabilities = Capabilities.chrome()

        //Set Options
        var chromeOptions = {
            //'args': ['--disable-extensions','--start-maximized','--disable-gpu']
            'args': ['--disable-extensions --start-maximized', '--headless',  '--disable-gpu']
        }
        chromeCapabilities.set('chromeOptions', chromeOptions);
    }

    // Read guild list and put into array
    var data = await readFile('./GUID list.txt', 'utf-8')
    var url_list =  (data.trim()).split("\n");
    
    // Try spawning robots
    try {            
        for (var i=0; i < url_list.length; i++){
            let u =  url_list[i]
            console.log("Start... " + i + " ..." + u)
            robots.push(await robot_loadtest(chromeCapabilities,u));
        }
    } catch (error) {
        console.log(error)
    }

    // Try killing robots
    try {            
        for (var i=0; i < robots.length; i++){
            let r = robots[i];
            console.log("closing... " + i);
            await r.wait(until.elementsLocated(by),10000,"@waitpageload");
            await r.close();
        }
    } catch (error) {
        console.log(error)
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function robot_loadtest(chromeCapabilities,url){
    var driver = new Builder()
    .forBrowser('chrome')
    .withCapabilities(chromeCapabilities)                
    .build();

    (await driver).get(url);
    return driver

}

function loadChromedriver(){
    try {
        const os = process.platform.toLowerCase();
        const path = require('path');

        let suffix = os == ("win32") ? os + ".exe" : os;
        let chromePath = drv_folder + drv_name + suffix;
        let pathstr = path.resolve(chromePath);
        var service = new chrome.ServiceBuilder(pathstr).build();
        chrome.setDefaultService(service);
    } catch (error) {
        console.log(error)
    }
}