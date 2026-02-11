# Ultimate Marketing Automation System

This system allows you to:
1.  **Auto-Fetch** existing students from your Database.
2.  **Import** new leads from Facebook/Google Ads.
3.  **Bulk Send** WhatsApp messages with **Images** to everyone.
4.  **Cost:** Minimal (Free Script + Free/Cheap Sender Tool).

---

## Part 1: Google Sheet Setup

1.  Create a new **Google Sheet**.
2.  Create **3 Tabs** at the bottom:
    *   **Tab 1 Name:** `DB_Sync` (For database students)
    *   **Tab 2 Name:** `Ad_Leads` (For Facebook/Google Ad leads)
    *   **Tab 3 Name:** `Master_List` (Combines both for sending)

### Tab Headers
*   **DB_Sync:** `ID`, `Name`, `Phone`, `Date Joined`
*   **Ad_Leads:** `Name`, `Phone`, `Source` (e.g., "FB Ads")
*   **Master_List:** `Name`, `Phone`, `Status`, `Message`

---

## Part 2: Connect Database (Auto-Script)

1.  Go to **Extensions** > **Apps Script**.
2.  Paste this code (I have pre-filled your secure keys):

```javascript
// --- CONFIGURATION ---
const SUPABASE_URL = 'https://glwjkylnwchtiyqisqdg.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsd2preWxud2NodGl5cWlzcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTc0ODcsImV4cCI6MjA4NDU3MzQ4N30.Xb_FvRIpeATxOE1MwxBd-bZwK0F2tY1-C878X-Nyof0'; 
const TARGET_SHEET = 'DB_Sync';

function syncDatabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TARGET_SHEET);
  const lastRow = sheet.getLastRow();
  const existingIds = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(String) : [];

  // Fetch Users
  const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,mobile_number,created_at&order=created_at.desc`;
  const options = { 'headers': { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } };

  try {
    const students = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    const newRows = [];

    students.forEach(s => {
      if (!existingIds.includes(String(s.id)) && s.mobile_number) {
        let phone = String(s.mobile_number).replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone; 
        
        newRows.push([s.id, s.full_name, phone, s.created_at]);
      }
    });

    if (newRows.length > 0) sheet.getRange(lastRow + 1, 1, newRows.length, 4).setValues(newRows);
    Logger.log(`Added ${newRows.length} students.`);
  } catch (e) { Logger.log("Error: " + e); }
}
```
3.  **Save** & **Run** once to test.
4.  Set a **Trigger** (Clock Icon) to run `syncDatabase` every hour.

---

## Part 3: Import Ad Leads (Ads Manager)

When you run Facebook or Google Ads:
1.  Go into your Ads Manager.
2.  Download your "Leads" as **CSV**.
3.  Open `Ad_Leads` tab in your Sheet.
4.  **Copy-Paste** the Name and Phone Number columns from the CSV into this tab.

*(Note: Advanced users can use Zapier to do this automatically, but Copy-Paste is free).*

---

## Part 4: Automated Sending (The "Magic" Step)

To send **Images** + **Text** automatically, you cannot use simple formulas. You need a **Bulk Sender Tool**.

### Recommended Tools (Chrome Extensions)
These tools read your Google Sheet and automate your WhatsApp Web to send messages one by one.
1.  **WAMessager** (Popular, easy)
2.  **Rocket Sender** 
3.  **WAPlus**

### How to Send:
1.  **Install** one of the extensions above in Chrome.
2.  Open **WhatsApp Web** on your computer.
3.  Open the extension -> Select "Upload Excel" or "Connect Google Sheet".
4.  Select your `Master_List` (or just export `DB_Sync` as CSV).
5.  **Attach Image**: The tool will have an "Upload Image" button. Upload your creative.
6.  **Type Message**: "Hello {{Name}}, check out this offer!" (It auto-fills names).
7.  **Click Send**: The tool will start sending automatically (e.g., 1 message every 5 seconds).

**⚠️ Safety Rule:** Do not send more than 500-1000 messages/day to avoid WhatsApp ban. Start slow.
