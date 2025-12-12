# HealthPlan Advisor Agent

We want to build an agent that will help Oregonians pick the best healthcare plan on Healtchare.gov.
Focusing on **Oregon** is a brilliant strategic move. It dramatically simplifies the technical complexity while maintaining high value.

**Why Oregon is easier:**

1.  **Federal Data:** Oregon currently uses the Federal Platform (Healthcare.gov) for 2025 enrollment, meaning you **can** use the standard CMS Public Use Files (no need to scrape a state website).
2.  **Clean Rating Areas:** Oregon has only **7 Rating Areas** based strictly on Counties.
3.  **"Standard" Plans:** Oregon mandates "Standard" plan designs (Bronze/Silver/Gold) with fixed copays, making comparison logic much easier to write.

Here is your **Bedrock Agent Specification** tailored specifically for the Oregon market.

-----

### **1. The Data Foundation (Knowledge Base)**

You need to download the **2025 CMS Public Use Files** and filter them *before* uploading to your Knowledge Base (S3/Athena). This reduces the file size from 4GB+ to a few megabytes.

**Files to Prepare:**

1.  **`Rate_PUF.csv` (Filtered for `StateCode = OR`)**
      * **Data:** Contains the base premium rates.
      * *Note:* Oregon rates are age-banded. You will see a "21-year-old rate". You must apply the **Federal Age Curve** (multiplier) to get the user's actual price.
2.  **`Plan_Attributes_PUF.csv` (Filtered for `StateCode = OR`)**
      * **Data:** Plan IDs, Marketing Names ("PacificSource Navigator Gold"), and the all-important `HSAEligible` flag.
3.  **`Service_Area_PUF.csv` (Filtered for `StateCode = OR`)**
      * **Data:** Maps Oregon Counties to Rating Areas (e.g., Multnomah = Rating Area 1).

-----

### **2. The Workflow (Agent Orchestration)**

The Agent follows a strict "Ask -\> Calculate -\> Advise" loop.

#### **Step A: The Oregon Geo-Locator**

  * **User Input:** "I live in 97204."
  * **Agent Logic:**
      * Oregon assigns prices by **County**, not Zip.
      * **Action:** Look up Zip 97204.
      * *Edge Case:* If the Zip spans two counties (e.g., 97005 covers Washington and Clackamas), the Agent **must ask**: *"Are you in Washington or Clackamas county?"*
      * **Output:** `RatingAreaId` (e.g., "Rating Area 1" for Portland Metro).

#### **Step B: The "Age Curve" Calculator**

  * **User Input:** "I am 44 years old."
  * **Agent Logic:**
      * The raw CSV says the plan is $400 (for a 21-year-old).
      * The Agent must apply the multiplier (approx 1.397 for age 44).
      * **Math:** `$400 * 1.397 = $558.80`.

#### **Step C: The "Sweet Spot" Logic (Oregon Edition)**

Oregon has very specific "Standard" plans. The agent should compare "Standard" vs. "Non-Standard".

  * **Action:** Query plans in `Rating Area 1`.
  * **Comparison:**
      * Calculate `Annual Premium + Deductible` for the cheapest **Bronze Standard**.
      * Calculate `Annual Premium + Deductible` for the cheapest **Silver Standard**.
      * **Advice:** If the Silver plan is only $50/month more but drops the deductible by $5,000, the Agent flags this as a **"High Value Upgrade."**

-----

### **3. Bedrock Agent Action Group Spec**

Here is the JSON structure for the API schema you need to define in Bedrock.

**Action Group Name:** `OregonPlanDataService`

**Function 1: `GetOregonRatingArea`**

  * **Description:** Converts Zip Code to Oregon Rating Area ID.
  * **Parameters:**
      * `zipCode` (String, Required)
      * `county` (String, Optional - only needed if zip splits counties)
  * **Returns:**
    ```json
    {
      "ratingAreaId": "Rating Area 1",
      "countyName": "Multnomah"
    }
    ```

**Function 2: `GetOregonPlans`**

  * **Description:** specific for retrieving active 2025 plans.
  * **Parameters:**
      * `ratingAreaId` (String, Required)
      * `age` (Integer, Required)
      * `smoker` (Boolean, Optional, default False)
  * **Returns:**
    ```json
    [
      {
        "planId": "12345OR0010001",
        "carrier": "Kaiser Foundation Health Plan",
        "marketingName": "Kaiser Bronze Standard",
        "monthlyPremium": 412.50,
        "deductible": 9100,
        "hsaEligible": false
      },
      {
        "planId": "98765OR0020001",
        "carrier": "Moda Health",
        "marketingName": "Moda HSA Bronze",
        "monthlyPremium": 435.00,
        "deductible": 7500,
        "hsaEligible": true
      }
    ]
    ```

-----

### **4. The "HSA Hack" Script (Oregon Specific)**

Add this specific logic to your System Prompt (Instructions):

> **HSA Detection Rule:**
> "In Oregon, carriers like **Moda** and **PacificSource** offer plans that are HSA-Eligible but often hide this fact in the fine print.
>
> IF `HSAEligible` is `True` in the data AND the User asks for "Tax Savings":
>
> 1.  Recommend the plan.
> 2.  Explicitly state: *'This plan allows you to open your own HSA at Fidelity or a Credit Union. You can deposit up to $4,300 (individual) tax-free, which lowers your effective premium by \~30% depending on your tax bracket.'*"

### **5. Implementation Steps for You**

1.  **S3:** Upload the *filtered* `Rate_PUF.csv` (only Oregon rows) to an S3 bucket.
2.  **Athena:** Create a simple table definition so you can query it with SQL.
3.  **Lambda:** Write a Python Lambda function (the Action Group Executor) that takes the `GetOregonPlans` request, constructs a SQL query for Athena (e.g., `SELECT * FROM oregon_rates WHERE RatingArea = 'Rating Area 1'`), applies the age multiplier, and returns the JSON.
4.  **Bedrock:** Connect this Lambda as the Action Group.

This architecture is fast, cheap (no massive database costs), and highly accurate for the Oregon market.