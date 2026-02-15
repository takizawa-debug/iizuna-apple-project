/**
 * Mock Google Apps Script Services
 */

const PropertiesService = {
    getScriptProperties: () => ({
        getProperty: (key) => {
            if (key === 'AWS_ACCESS_KEY_ID') return 'MOCK_ACCESS_KEY';
            if (key === 'AWS_SECRET_ACCESS_KEY') return 'MOCK_SECRET_KEY';
            if (key === 'TR_API_KEY') return 'MOCK_API_KEY';
            return null;
        }
    })
};

const LockService = {
    getScriptLock: () => ({
        waitLock: (ms) => console.log(`[Mock] LockService.waitLock(${ms})`),
        releaseLock: () => console.log('[Mock] LockService.releaseLock')
    })
};

const SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
        getSheetByName: (name) => {
            console.log(`[Mock] getSheetByName("${name}")`);
            return createMockSheet(name);
        },
        insertSheet: (name) => {
            console.log(`[Mock] insertSheet("${name}")`);
            return createMockSheet(name);
        }
    }),
    getActiveSheet: () => createMockSheet("ActiveSheet")
};

function createMockSheet(name) {
    return {
        getName: () => name,
        getLastRow: () => 10, // Mock existing rows
        getRange: (row, col, numRows, numCols) => ({
            setValues: (values) => console.log(`[Mock] Sheet("${name}").getRange(${row},${col}...).setValues(...)`),
            setValue: (value) => console.log(`[Mock] Sheet("${name}").getRange(${row},${col}...).setValue("${value}")`),
            setBackground: () => ({ setFontColor: () => ({ setFontWeight: () => ({ setFrozenRows: () => { } }) }) }), // Chainable
            getValues: () => [], // Return empty for now, or mock data if needed
        }),
        appendRow: (row) => {
            console.log(`[Mock] Sheet("${name}").appendRow:`, JSON.stringify(row, null, 2));
            return { getRow: () => 11 };
        }
    };
}

const Utilities = {
    formatDate: (date, tz, format) => `MOCK_DATE(${format})`,
    base64Decode: (str) => Buffer.from(str, 'base64'),
    newBlob: (bytes, contentType, name) => ({
        getName: () => name,
        getContentType: () => contentType,
        getBytes: () => bytes
    }),
    computeDigest: (algo, bytes) => Array.from(Buffer.from("mock_digest")),
    computeHmacSha256Signature: (data, key) => Array.from(Buffer.from("mock_signature")),
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    sleep: (ms) => console.log(`[Mock] Utilities.sleep(${ms})`)
};

const UrlFetchApp = {
    fetch: (url, options) => {
        console.log(`[Mock] UrlFetchApp.fetch("${url}")`);
        if (options) console.log(`[Mock] Options:`, JSON.stringify(options, (k, v) => k === 'payload' ? '[Bytes]' : v, 2));

        return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: "Mock Gemini Response" }] } }] })
        };
    }
};

const ContentService = {
    MimeType: { JSON: 'JSON' },
    createTextOutput: (content) => ({
        setMimeType: (type) => ({
            getContent: () => content
        })
    })
};

const GmailApp = {
    sendEmail: (recipient, subject, body, options) => {
        console.log(`[Mock] GmailApp.sendEmail to=${recipient}, subject="${subject}"`);
    }
};

module.exports = {
    PropertiesService,
    LockService,
    SpreadsheetApp,
    Utilities,
    UrlFetchApp,
    ContentService,
    GmailApp
};
