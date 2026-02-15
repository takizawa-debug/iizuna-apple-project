const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mocks = require('./mock/gas-mocks');

// Load GAS Code
const gasFilePath = path.join(__dirname, '../Inport/保存処理.js');
const formSettingsPath = path.join(__dirname, '../Inport/フォーム設定.js');

const gasCode = fs.readFileSync(gasFilePath, 'utf8');
const formSettingsCode = fs.readFileSync(formSettingsPath, 'utf8');

// Prepare sandbox
const sandbox = {
    ...mocks,
    console: console,
    JSON: JSON,
    Date: Date,
    // Helper for debug
    print: (msg) => console.log(msg)
};

vm.createContext(sandbox);

// 1. Load Form Settings (Dependency)
try {
    vm.runInContext(formSettingsCode, sandbox);
    console.log("✅ Form Settings loaded.");
} catch (e) {
    console.error("❌ Error loading Form Settings:", e);
    process.exit(1);
}

// 2. Load Main GAS Code
try {
    vm.runInContext(gasCode, sandbox);
    console.log("✅ GAS Code loaded successfully.");
} catch (e) {
    console.error("❌ Error loading GAS code:", e);
    process.exit(1);
}

// Prepare Test Data
const testEvent = {
    postData: {
        contents: JSON.stringify({
            rep_name: "Test User",
            art_type: "shop",
            art_title: "Test Shop",
            art_body: "This is a test submission from local mock.",
            cat_l1: "食べる", // Matches a likely category
            images: []
        })
    }
};

// Run doPost
console.log("\n🚀 Running doPost(e)...");
try {
    const result = sandbox.doPost(testEvent);
    console.log("\n✅ Result:", result.getContent());
} catch (e) {
    console.error("\n❌ Runtime Error:", e);
}
