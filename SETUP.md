# Setup Guide - Wildlife Call Management Dashboard

This guide will help you set up and run the Wildlife Call Management Dashboard on your local machine.

## Prerequisites

Choose which dashboard you want to run:

### For Next.js Dashboard (main branch)
- Node.js 18 or higher
- npm (comes with Node.js)

### For Streamlit Dashboard (python branch)
- Python 3.8 or higher
- pip (comes with Python)

### For Both
- Google Cloud account (free tier works)
- A Google Sheet with your wildlife incident data

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/JayPatil165/Wildlife-Call-Management.git
cd Wildlife-Call-Management
```

Choose your preferred dashboard:

**For Next.js Dashboard:**
```bash
git checkout main
cd next-dashboard
```

**For Streamlit Dashboard:**
```bash
git checkout python
cd "Streamlit Dashboard/session-wise-rendering"
```

---

## Step 2: Set Up Google Sheets API

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Wildlife Dashboard")
4. Click "Create"

### 2.2 Enable Google Sheets API

1. In your new project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and press **"Enable"**

### 2.3 Create Service Account Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - Service account name: `wildlife-dashboard`
   - Description: "Service account for wildlife dashboard"
4. Click **"Create and Continue"**
5. Skip optional steps, click **"Done"**

### 2.4 Generate JSON Key File

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create New Key"**
4. Select **"JSON"** format
5. Click **"Create"** - a JSON file will download

**Save this file!** You'll need it in the next step.

---

## Step 3: Configure Your Dashboard

### 3.1 Copy Example Files

**For Next.js:**
```bash
cp credentials.json.example credentials.json
cp sheetid.txt.example sheetid.txt
```

**For Streamlit:**
```bash
cp credentials.json.example credentials.json
cp sheetid.txt.example sheetid.txt
```

### 3.2 Add Your Google Credentials

1. Open the `credentials.json` file you just created
2. Open the JSON file you downloaded from Google Cloud
3. Copy **all** the content from the downloaded file
4. Paste it into your `credentials.json` file
5. Save and close

### 3.3 Add Your Google Sheet ID

1. Open your Google Sheet in a browser
2. Look at the URL - it looks like this:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                          ^^^^^^^^^^^^^^^^^^^
                                          This is your Sheet ID
   ```
3. Copy just the Sheet ID part (between `/d/` and `/edit`)
4. Open `sheetid.txt` and paste the ID
5. Save and close

### 3.4 Share Your Google Sheet

1. Open your Google Sheet
2. Click the **"Share"** button (top right)
3. In the email field, paste the **`client_email`** from your `credentials.json` file
   - It looks like: `wildlife-dashboard@your-project.iam.gserviceaccount.com`
4. Give it **"Viewer"** access (or "Editor" if you want the dashboard to modify data)
5. Click **"Send"**

---

## Step 4: Install Dependencies

### For Next.js Dashboard

```bash
npm install
```

This will install all required packages (React, Next.js, Plotly, etc.)

### For Streamlit Dashboard

**Create a virtual environment (recommended):**

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

**Install packages:**
```bash
pip install -r requirements.txt
```

---

## Step 5: Run the Dashboard

### Next.js Dashboard

```bash
npm run dev
```

The dashboard will open at: **http://localhost:3000**

### Streamlit Dashboard

```bash
streamlit run app.py
```

The dashboard will automatically open in your browser at: **http://localhost:8501**

---

## Common Issues & Solutions

### "Failed to fetch data" or "Authentication failed"

**Check:**
- Is `credentials.json` properly formatted JSON?
- Did you share the Google Sheet with the service account email?
- Is the Sheet ID correct in `sheetid.txt`?
- Is Google Sheets API enabled in your project?

### "Module not found" errors

**Solution:**
- Next.js: Run `npm install` again
- Streamlit: Make sure virtual environment is activated, run `pip install -r requirements.txt`

### Port already in use

**Solution:**
- Next.js: The app will suggest a different port, or kill the process using port 3000
- Streamlit: Use `streamlit run app.py --server.port 8502`

### Changes not showing up

**Solution:**
- Next.js: Delete `.next` folder and restart: `rm -rf .next && npm run dev`
- Streamlit: Streamlit auto-reloads, but you can force refresh in browser

---

## Building for Production

### Next.js Dashboard

```bash
npm run build
npm start
```

Runs on **http://localhost:3000**

### Streamlit Dashboard

Deploy using [Streamlit Community Cloud](https://streamlit.io/cloud) or other hosting services.

---

## Data Format Requirements

Your Google Sheet should have columns matching these field names (in Marathi):
- टाइमस्टॅम्प (Timestamp)
- तालुका (Taluka)
- गाव (Village)
- कॉल करणाऱ्याचा मोबाईल नंबर (Caller mobile)
- कोणत्या वन्यप्राण्याची नोंद करू इच्छिता (Wildlife species)
- घटना प्रकार (Incident type)

The dashboard will automatically parse and display this data.

---

## Security Notes

⚠️ **NEVER commit these files to git:**
- `credentials.json` - Contains private API keys
- `sheetid.txt` - May contain sensitive sheet IDs
- Any `.xlsx` or `.pdf` data files

These are already in `.gitignore` to protect you.

---

## Need Help?

1. Check this guide again carefully
2. Verify all steps in "Common Issues" section
3. Open an issue on GitHub with:
   - Which dashboard you're using (Next.js or Streamlit)
   - Error message (if any)
   - What step you're stuck on

---

## Next Steps

Once your dashboard is running:

1. **Explore the data** - Try different filters and chart types
2. **Customize** - Modify code to add new charts or features
3. **Share** - Deploy to production for your team to use
4. **Contribute** - Submit improvements via pull requests

Happy analyzing! 🐾📊
